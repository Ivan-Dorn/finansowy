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
    amount: Number(row.amount || 0),
    type: row.type,

    purchasePrice:
      row.purchase_price !== null &&
      row.purchase_price !== undefined
        ? Number(row.purchase_price)
        : undefined,

    salePrice:
      row.sale_price !== null &&
      row.sale_price !== undefined
        ? Number(row.sale_price)
        : undefined,

    date: row.date,
    time: String(row.time || "").slice(0, 5),
  };
}

export function FinanceProvider({ children }) {
  const [operations, setOperations] = useState([]);
  const [stock, setStock] = useState([]);
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

      const [
        operationsResult,
        settingsResult,
        stockResult,
      ] = await Promise.all([
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

        supabase
          .from("stock_products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (operationsResult.error) {
        console.error(
          "Błąd pobierania operacji:",
          operationsResult.error
        );
      }

      if (settingsResult.error) {
        console.error(
          "Błąd pobierania ustawień:",
          settingsResult.error
        );
      }

      if (stockResult.error) {
        console.error(
          "Błąd pobierania składu:",
          stockResult.error
        );
      }

      const loadedOperations =
        operationsResult.data?.map(mapOperation) || [];

      const loadedStock =
        stockResult.data || [];

      const loadedBalance =
        settingsResult.data
          ? Number(
              settingsResult.data.starting_balance || 0
            )
          : 0;

      if (mounted) {
        setOperations(loadedOperations);
        setStock(loadedStock);
        setStartingBalance(loadedBalance);
        setLoading(false);
      }
    }

    loadFinance();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // DODAWANIE OPERACJI
  // =========================

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
      console.error(
        "Błąd dodawania operacji:",
        error
      );
      return;
    }

    setOperations((current) => [
      mapOperation(row),
      ...current,
    ]);
  }

  // =========================
  // USUWANIE OPERACJI
  // =========================

  async function removeOperation(id) {
    const { error } = await supabase
      .from("operations")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) {
      console.error(
        "Błąd usuwania operacji:",
        error
      );
      return;
    }

    setOperations((current) =>
      current.filter(
        (operation) => operation.id !== id
      )
    );
  }

  // =========================
  // DODAWANIE PRODUKTU DO SKŁADU
  // =========================

  async function addStockProduct(
    name,
    quantity,
    purchasePrice
  ) {
    if (!user) return;

    const row = {
      user_id: user.id,
      name: name.trim(),
      quantity: Number(quantity),
      purchase_price: Number(purchasePrice),
    };

    const { data, error } = await supabase
      .from("stock_products")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error(
        "Błąd dodawania produktu do składu:",
        error
      );
      return;
    }

    setStock((current) => [
      data,
      ...current,
    ]);
  }

  // =========================
  // USUWANIE PRODUKTU ZE SKŁADU
  // =========================

  async function removeStockProduct(productId) {
    if (!user) return;

    const { error } = await supabase
      .from("stock_products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Błąd usuwania produktu ze składu:",
        error
      );
      return;
    }

    setStock((current) =>
      current.filter(
        (product) => product.id !== productId
      )
    );
  }

  // =========================
  // SPRZEDAŻ PRODUKTU ZE SKŁADU
  // =========================

  async function sellStockProduct(
    productId,
    quantity,
    salePrice
  ) {
    if (!user) return;

    const amount = Number(quantity);
    const sellingPrice = Number(salePrice);

    const product = stock.find(
      (item) => item.id === productId
    );

    if (!product) return;

    const currentQuantity =
      Number(product.quantity);

    const purchasePrice =
      Number(product.purchase_price);

    if (
      amount <= 0 ||
      amount > currentQuantity ||
      sellingPrice <= 0
    ) {
      return;
    }

    const totalSale =
      sellingPrice * amount;

    const totalPurchase =
      purchasePrice * amount;

    const now = new Date();

    const operationRow = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: product.name,
      amount: totalSale,
      type: "income",
      purchase_price: totalPurchase,
      sale_price: totalSale,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Najpierw zapis sprzedaży
    const { error: saleError } =
      await supabase
        .from("operations")
        .insert(operationRow);

    if (saleError) {
      console.error(
        "Błąd zapisu sprzedaży:",
        saleError
      );
      return;
    }

    const newQuantity =
      currentQuantity - amount;

    // Następnie zmniejszenie składu
    const {
      data: updatedProduct,
      error: stockError,
    } = await supabase
      .from("stock_products")
      .update({
        quantity: newQuantity,
      })
      .eq("id", productId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (stockError) {
      console.error(
        "Błąd aktualizacji składu:",
        stockError
      );

      // Jeżeli aktualizacja składu się nie udała,
      // usuwamy zapis sprzedaży, żeby dane się
      // nie rozjechały.
      await supabase
        .from("operations")
        .delete()
        .eq("id", operationRow.id)
        .eq("user_id", user.id);

      return;
    }

    setOperations((current) => [
      mapOperation(operationRow),
      ...current,
    ]);

    setStock((current) =>
      current.map((item) =>
        item.id === productId
          ? updatedProduct
          : item
      )
    );
  }

  // =========================
  // STAN POCZĄTKOWY
  // =========================

  async function updateStartingBalance(
    value
  ) {
    if (!user) return;

    const amount =
      Number(value) || 0;

    const { error } =
      await supabase
        .from("finance_settings")
        .upsert({
          user_id: user.id,
          starting_balance: amount,
          updated_at:
            new Date().toISOString(),
        });

    if (error) {
      console.error(
        "Błąd zapisywania stanu początkowego:",
        error
      );
      return;
    }

    setStartingBalance(amount);
  }

  // =========================
  // OBLICZENIA FINANSOWE
  // =========================

  const finances = useMemo(() => {
    const sales = operations.filter(
      (operation) =>
        operation.type === "income"
    );

    const expenses = operations.filter(
      (operation) =>
        operation.type === "expense"
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

    const expensesTotal =
      expenses.reduce(
        (sum, operation) =>
          sum +
          Number(
            operation.amount || 0
          ),
        0
      );

    // Zysk na sprzedaży
    const profit =
      turnover - purchaseCosts;

    // Czysty zysk po dodatkowych wydatkach
    const netProfit =
      profit - expensesTotal;

    // Stan pieniędzy
    const currentBalance =
      Number(startingBalance) +
      netProfit;

    return {
      turnover,
      purchaseCosts,
      expenses: expensesTotal,
      profit,
      netProfit,
      currentBalance,
      startingBalance,
    };
  }, [
    operations,
    startingBalance,
  ]);

  // =========================
  // ŁADOWANIE
  // =========================

  if (loading) {
    return (
      <div className="auth-loading">
        Ładowanie danych...
      </div>
    );
  }

  // =========================
  // CONTEXT
  // =========================

  return (
    <FinanceContext.Provider
      value={{
        // Finanse
        operations,
        finances,

        // Operacje
        addOperation,
        removeOperation,

        // Skład
        stock,
        addStockProduct,
        removeStockProduct,
        sellStockProduct,

        // Ustawienia
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
  return useContext(
    FinanceContext
  );
}