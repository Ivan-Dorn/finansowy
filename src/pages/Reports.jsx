import { useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Reports() {
  const { operations, finances } = useFinance();

  const statistics = useMemo(() => {
    const sales = operations.filter(
      (operation) => operation.type === "income"
    );

    const expenses = operations.filter(
      (operation) => operation.type === "expense"
    );

    const averageSale =
      sales.length > 0
        ? finances.turnover / sales.length
        : 0;

    const averageExpense =
      expenses.length > 0
        ? finances.expenses / expenses.length
        : 0;

    const margin =
      finances.turnover > 0
        ? (finances.profit / finances.turnover) * 100
        : 0;

    return {
      salesCount: sales.length,
      expensesCount: expenses.length,
      averageSale,
      averageExpense,
      margin,
    };
  }, [operations, finances]);

  return (
    <section className="reports-page">
      <div className="page-heading">
        <span className="section-label">RAPORTY</span>
        <h2>Raporty</h2>
      </div>

      <div className="reports-main-card">
        <div className="reports-main-info">
          <span className="report-label">CZYSTY ZYSK</span>

          <strong className="reports-profit">
            {formatCurrency(finances.netProfit)}
          </strong>

          <p>
            Zysk po odjęciu kosztów zakupu oraz
            dodatkowych wydatków.
          </p>
        </div>

        <div className="reports-main-side">
          <div>
            <span>OBRÓT</span>
            <strong>
              {formatCurrency(finances.turnover)}
            </strong>
          </div>

          <div>
            <span>KOSZT ZAKUPU</span>
            <strong>
              {formatCurrency(finances.purchaseCosts)}
            </strong>
          </div>

          <div>
            <span>WYDATKI</span>
            <strong>
              {formatCurrency(finances.expenses)}
            </strong>
          </div>

          <div>
            <span>STAN TERAZ</span>
            <strong>
              {formatCurrency(finances.currentBalance)}
            </strong>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="reports-section-heading">
          <span className="section-label">ANALIZA</span>
          <h3>Twój wynik</h3>
        </div>

        <div className="reports-grid">
          <div className="reports-card">
            <span>ZYSK ZE SPRZEDAŻY</span>
            <strong className="green-text">
              {formatCurrency(finances.profit)}
            </strong>
            <small>
              Obrót − koszt zakupu
            </small>
          </div>

          <div className="reports-card">
            <span>WYDATKI</span>
            <strong>
              {formatCurrency(finances.expenses)}
            </strong>
            <small>
              {statistics.expensesCount} operacji
            </small>
          </div>

          <div className="reports-card">
            <span>MARŻA</span>
            <strong>
              {statistics.margin.toFixed(1)}%
            </strong>
            <small>
              Zysk względem obrotu
            </small>
          </div>

          <div className="reports-card">
            <span>SPRZEDAŻE</span>
            <strong>
              {statistics.salesCount}
            </strong>
            <small>
              Średnio{" "}
              {formatCurrency(statistics.averageSale)}
            </small>
          </div>
        </div>
      </div>

      <div className="reports-bottom">
        <div className="reports-card large">
          <div className="reports-card-heading">
            <span className="section-label">
              ROZKŁAD FINANSÓW
            </span>
            <h3>Gdzie idą pieniądze</h3>
          </div>

          <div className="money-row">
            <div>
              <span>Obrót</span>
              <strong>
                {formatCurrency(finances.turnover)}
              </strong>
            </div>

            <div className="money-bar">
              <div
                className="money-fill turnover-fill"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="money-row">
            <div>
              <span>Koszt zakupu</span>
              <strong>
                {formatCurrency(finances.purchaseCosts)}
              </strong>
            </div>

            <div className="money-bar">
              <div
                className="money-fill purchase-fill"
                style={{
                  width:
                    finances.turnover > 0
                      ? `${Math.min(
                          (finances.purchaseCosts /
                            finances.turnover) *
                            100,
                          100
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="money-row">
            <div>
              <span>Dodatkowe wydatki</span>
              <strong>
                {formatCurrency(finances.expenses)}
              </strong>
            </div>

            <div className="money-bar">
              <div
                className="money-fill expense-fill"
                style={{
                  width:
                    finances.turnover > 0
                      ? `${Math.min(
                          (finances.expenses /
                            finances.turnover) *
                            100,
                          100
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

        <div className="reports-card large">
          <div className="reports-card-heading">
            <span className="section-label">
              STATYSTYKI
            </span>
            <h3>Średnie wartości</h3>
          </div>

          <div className="stat-row">
            <span>Średnia sprzedaż</span>
            <strong>
              {formatCurrency(statistics.averageSale)}
            </strong>
          </div>

          <div className="stat-row">
            <span>Średni wydatek</span>
            <strong>
              {formatCurrency(statistics.averageExpense)}
            </strong>
          </div>

          <div className="stat-row">
            <span>Liczba sprzedaży</span>
            <strong>{statistics.salesCount}</strong>
          </div>

          <div className="stat-row">
            <span>Liczba wydatków</span>
            <strong>{statistics.expensesCount}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reports;