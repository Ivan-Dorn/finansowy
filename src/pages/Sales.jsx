import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Sales() {
  const { operations, addOperation, removeOperation } = useFinance();

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const sales = operations.filter(
    (operation) => operation.type === "income"
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !name.trim() ||
      !purchasePrice ||
      !salePrice ||
      Number(purchasePrice) < 0 ||
      Number(salePrice) <= 0
    ) {
      return;
    }

    addOperation(name, salePrice, "income", {
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
    });

    setName("");
    setPurchasePrice("");
    setSalePrice("");
  }

  return (
    <section>
      <div className="page-heading">
        <span className="section-label">SPRZEDAŻ</span>
        <h2>Dodaj sprzedaż</h2>
      </div>

      <form className="operation-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa produktu"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Cena zakupu"
          value={purchasePrice}
          onChange={(event) =>
            setPurchasePrice(event.target.value)
          }
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Cena sprzedaży"
          value={salePrice}
          onChange={(event) =>
            setSalePrice(event.target.value)
          }
        />

        <button className="action-button primary" type="submit">
          ＋ Dodaj sprzedaż
        </button>
      </form>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">HISTORIA</span>
            <h2>Sprzedaż</h2>
          </div>
        </div>

        <div className="operations">
          {sales.length === 0 ? (
            <p className="empty-state">
              Brak sprzedaży.
            </p>
          ) : (
            sales.map((sale) => {
              const purchase = Number(
                sale.purchasePrice ?? 0
              );

              const selling = Number(
                sale.salePrice ?? sale.amount ?? 0
              );

              const profit = selling - purchase;

              return (
                <div className="operation" key={sale.id}>
                  <div className="operation-icon income">
                    +
                  </div>

                  <div className="operation-info">
                    <strong>{sale.name}</strong>

                    <span>
                      Zakup: {formatCurrency(purchase)} •
                      Sprzedaż: {formatCurrency(selling)} •
                      {sale.time}
                    </span>
                  </div>

                  <strong
                    className={
                      profit >= 0
                        ? "operation-income"
                        : "operation-expense"
                    }
                  >
                    {profit >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(profit))}
                  </strong>

                  <button
                    className="operation-delete"
                    onClick={() => removeOperation(sale.id)}
                    title="Usuń sprzedaż"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default Sales;