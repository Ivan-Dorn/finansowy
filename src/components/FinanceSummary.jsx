import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function FinanceSummary() {
  const { finances } = useFinance();

  return (
    <section className="finance-summary">
      <div className="finance-item">
        <span>OBRÓT</span>
        <strong>
          {formatCurrency(finances.turnover)}
        </strong>
      </div>

      <div className="finance-item">
        <span>KOSZT ZAKUPU</span>
        <strong>
          {formatCurrency(finances.purchaseCosts)}
        </strong>
      </div>

      <div className="finance-item">
        <span>WYDATKI</span>
        <strong>
          {formatCurrency(finances.expenses)}
        </strong>
      </div>

      <div className="finance-item">
        <span>ZYSK</span>
        <strong className="profit">
          {formatCurrency(finances.profit)}
        </strong>
      </div>

      <div className="finance-item">
        <span>CZYSTY ZYSK</span>
        <strong className="profit">
          {formatCurrency(finances.netProfit)}
        </strong>
      </div>

      <div className="finance-item current-balance">
        <span>STAN TERAZ</span>
        <strong>
          {formatCurrency(finances.currentBalance)}
        </strong>
      </div>
    </section>
  );
}

export default FinanceSummary;