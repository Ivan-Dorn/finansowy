import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Expenses() {
  const { operations, addOperation, removeOperation } = useFinance();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const expenses = operations.filter(
    (operation) => operation.type === "expense"
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !name.trim() ||
      !amount ||
      Number(amount) <= 0
    ) {
      return;
    }

    addOperation(name, amount, "expense");

    setName("");
    setAmount("");
  }

  return (
    <section>
      <div className="page-heading">
        <span className="section-label">WYDATKI</span>
        <h2>Dodaj wydatek</h2>
      </div>

      <form className="operation-form expense-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa wydatku"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Kwota"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <button className="action-button" type="submit">
          − Dodaj wydatek
        </button>
      </form>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">HISTORIA</span>
            <h2>Wydatki</h2>
          </div>
        </div>

        <div className="operations">
          {expenses.length === 0 ? (
            <p className="empty-state">
              Brak wydatków.
            </p>
          ) : (
            expenses.map((expense) => (
              <div className="operation" key={expense.id}>
                <div className="operation-icon expense">
                  −
                </div>

                <div className="operation-info">
                  <strong>{expense.name}</strong>

                  <span>
                    {expense.date} • {expense.time}
                  </span>
                </div>

                <strong className="operation-expense">
                  -{formatCurrency(expense.amount)}
                </strong>

                <button
                  className="operation-delete"
                  onClick={() =>
                    removeOperation(expense.id)
                  }
                  title="Usuń wydatek"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Expenses;