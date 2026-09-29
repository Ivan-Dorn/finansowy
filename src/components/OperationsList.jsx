import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function OperationsList() {
  const { operations, removeOperation } = useFinance();

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="section-label">OPERACJE</span>
          <h2>Dzisiaj</h2>
        </div>
      </div>

      <div className="operations">
        {operations.length === 0 ? (
          <p className="empty-state">Brak operacji.</p>
        ) : (
          operations.slice(0, 6).map((operation) => (
            <div className="operation" key={operation.id}>
              <div className={`operation-icon ${operation.type}`}>
                {operation.type === "income" ? "+" : "−"}
              </div>

              <div className="operation-info">
                <strong>{operation.name}</strong>
                <span>
                  {operation.date} • {operation.time}
                </span>
              </div>

              <strong
                className={
                  operation.type === "income"
                    ? "operation-income"
                    : "operation-expense"
                }
              >
                {operation.type === "income" ? "+" : "-"}
                {formatCurrency(operation.amount)}
              </strong>

              <button
                className="operation-delete"
                onClick={() => removeOperation(operation.id)}
                title="Usuń"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default OperationsList;