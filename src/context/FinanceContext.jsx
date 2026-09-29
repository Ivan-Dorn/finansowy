import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const FinanceContext = createContext(null);

function mapOperation(row) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    type: row.type,
    purchasePrice:
      row.purchase_price !== null
        ? Number(row.purchase_price)
        : undefined,
    salePrice:
      row.sale_price !== null
        ? Number(row.sale_price)
        : undefined,
    date: row.date,
    time: String(row.time).slice(0, 5),
  };
}

export function FinanceProvider({ children }) {
  const [operations, setOperations] = useState([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFinance() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      if (mounted) {
        setUser(user);
      }

      const [operationsResult, settingsResult] =
        await Promise.all([
          supabase
            .from("operations")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false }),

          supabase
            .from("finance_settings")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      if (operationsResult.error) {
        console.error(operationsResult.error);
      }

      if (settingsResult.error) {
        console.error(settingsResult.error);
      }

      let loadedOperations =
        operationsResult.data?.map(mapOperation) || [];

      let loadedBalance =
        settingsResult.data?.starting_balance
          ? Number(settingsResult.data.starting_balance)
          : 0;

      // Jednorazowa migracja starych danych lokalnych
      if (loadedOperations.length === 0) {
        try {
          const oldData = localStorage.getItem(
            "finansowy_data_v1"
          );

          const oldOperations = localStorage.getItem(
            "finansowy_operations"
          );

          const oldBalance = localStorage.getItem(
            "finansowy_starting_balance"
          );

          let localOperations = [];

          if (oldData) {
            const parsed = JSON.parse(oldData);

            localOperations =
              parsed.operations || [];

            if (
              !settingsResult.data &&
              parsed.startingBalance !== undefined
            ) {
              loadedBalance =
                Number(parsed.startingBalance) || 0;
            }
          } else if (oldOperations) {
            localOperations =
              JSON.parse(oldOperations);

            if (!settingsResult.data && oldBalance) {
              loadedBalance = Number(oldBalance) || 0;
            }
          }

          if (localOperations.length > 0) {
            const rows = localOperations.map(
              (operation) => ({
                id: crypto.randomUUID(),
                user_id: user.id,
                name: operation.name,
                amount: Number(
                  operation.amount || 0
                ),
                type: operation.type,
                purchase_price:
                  operation.purchasePrice ?? null,
                sale_price:
                  operation.salePrice ??
                  operation.amount ??
                  null,
                date:
                  operation.date ||
                  new Date()
                    .toISOString()
                    .split("T")[0],
                time:
                  operation.time || "00:00",
              })
            );

            const { error } =
              await supabase
                .from("operations")
                .insert(rows);

            if (!error) {
              loadedOperations =
                rows.map(mapOperation);
            }
          }

          if (!settingsResult.data) {
            await supabase
              .from("finance_settings")
              .upsert({
                user_id: user.id,
                starting_balance: loadedBalance,
              });
          }
        } catch (error) {
          console.error(
            "Migracja danych:",
            error
          );
        }
      }

      if (mounted) {
        setOperations(loadedOperations);
        setStartingBalance(loadedBalance);
        setLoading(false);
      }
    }

    loadFinance();

    return () => {
      mounted = false;
    };
  }, []);

  async function addOperation(
    name,
    amount,
    type,
    details = {}
  ) {
    if (!user) return;

    const now = new Date();

    const row = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: name.trim(),
      amount: Number(amount),
      type,
      purchase_price:
        details.purchasePrice ?? null,
      sale_price:
        details.salePrice ??
        (type === "income"
          ? Number(amount)
          : null),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const { error } = await supabase
      .from("operations")
      .insert(row);

    if (error) {
      console.error(error);
      return;
    }

    setOperations((current) => [
      mapOperation(row),
      ...current,
    ]);
  }

  async function removeOperation(id) {
    const { error } = await supabase
      .from("operations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setOperations((current) =>
      current.filter(
        (operation) => operation.id !== id
      )
    );
  }

  async function updateStartingBalance(value) {
    const amount = Number(value) || 0;

    if (!user) return;

    const { error } = await supabase
      .from("finance_settings")
      .upsert({
        user_id: user.id,
        starting_balance: amount,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      return;
    }

    setStartingBalance(amount);
  }

  const finances = useMemo(() => {
    const sales = operations.filter(
      (operation) => operation.type === "income"
    );

    const expenses = operations.filter(
      (operation) => operation.type === "expense"
    );

    const turnover = sales.reduce(
      (sum, operation) =>
        sum +
        Number(
          operation.salePrice ??
            operation.amount ??
            0
        ),
      0
    );

    const purchaseCosts = sales.reduce(
      (sum, operation) =>
        sum +
        Number(
          operation.purchasePrice ?? 0
        ),
      0
    );

    const expensesTotal = expenses.reduce(
      (sum, operation) =>
        sum + Number(operation.amount || 0),
      0
    );

    const profit =
      turnover - purchaseCosts;

    const netProfit =
      profit - expensesTotal;

    const currentBalance =
      startingBalance + netProfit;

    return {
      turnover,
      purchaseCosts,
      expenses: expensesTotal,
      profit,
      netProfit,
      currentBalance,
      startingBalance,
    };
  }, [operations, startingBalance]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#090b0d",
          color: "white",
        }}
      >
        Ładowanie danych...
      </div>
    );
  }

  return (
    <FinanceContext.Provider
      value={{
        operations,
        finances,
        addOperation,
        removeOperation,
        startingBalance,
        setStartingBalance:
          updateStartingBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}