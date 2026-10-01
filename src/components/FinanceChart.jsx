import { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

const periodOptions = [
  { value: "today", label: "Dzisiaj" },
  { value: "week", label: "Ten tydzień" },
  { value: "month", label: "Ten miesiąc" },
  { value: "year", label: "Ten rok" },
];

function FinanceChart() {
  const { operations } = useFinance();
  const [period, setPeriod] = useState("week");

  const chartData = useMemo(() => {
    const now = new Date();

    let daysCount = 7;

    if (period === "month") {
      daysCount = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
    }

    if (period === "year") {
      const months = Array.from({ length: 12 }, (_, index) => ({
        label: new Date(
          now.getFullYear(),
          index,
          1
        ).toLocaleDateString("pl-PL", {
          month: "short",
        }),
        income: 0,
        costs: 0,
      }));

      operations.forEach((operation) => {
        const date = new Date(`${operation.date}T00:00:00`);

        if (
          date.getFullYear() !== now.getFullYear()
        ) {
          return;
        }

        const index = date.getMonth();

        if (operation.type === "income") {
          months[index].income += Number(
            operation.salePrice ?? operation.amount ?? 0
          );

          months[index].costs += Number(
            operation.purchasePrice ?? 0
          );
        } else {
          months[index].costs += Number(
            operation.amount ?? 0
          );
        }
      });

      return months;
    }

    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - i);

      const dateKey =
        date.toISOString().split("T")[0];

      const day = {
        label: date.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
        }),
        income: 0,
        costs: 0,
      };

      operations.forEach((operation) => {
        if (operation.date !== dateKey) {
          return;
        }

        if (operation.type === "income") {
          day.income += Number(
            operation.salePrice ?? operation.amount ?? 0
          );

          day.costs += Number(
            operation.purchasePrice ?? 0
          );
        } else {
          day.costs += Number(
            operation.amount ?? 0
          );
        }
      });

      result.push(day);
    }

    return result;
  }, [operations, period]);

  const maxValue = Math.max(
    ...chartData.map((item) =>
      Math.max(item.income, item.costs)
    ),
    1
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="section-label">
            WYNIK FINANSOWY
          </span>

          <h2>
            {period === "today" && "Dzisiaj"}
            {period === "week" && "Ten tydzień"}
            {period === "month" && "Ten miesiąc"}
            {period === "year" && "Ten rok"}
          </h2>
        </div>

        <CustomSelect
          className="finance-chart-select"
          value={period}
          onChange={(val) => setPeriod(val)}
          options={periodOptions}
        />
      </div>

      <div className="chart">
        {chartData.map((item, index) => (
          <div className="bar-wrapper" key={index}>
            <div
              className="bar bar-income"
              style={{
                height: `${Math.max(
                  (item.income / maxValue) * 100,
                  2
                )}%`,
              }}
              title={`Obrót: ${formatCurrency(item.income)}`}
            />

            <div
              className="bar bar-expense"
              style={{
                height: `${Math.max(
                  (item.costs / maxValue) * 100,
                  2
                )}%`,
              }}
              title={`Koszty: ${formatCurrency(item.costs)}`}
            />
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-dot income-dot" />
          Obrót
        </span>

        <span>
          <i className="legend-dot expense-dot" />
          Koszty
        </span>
      </div>
    </section>
  );
}

export default FinanceChart;