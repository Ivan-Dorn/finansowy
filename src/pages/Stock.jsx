import { useState } from "react";
import NumberInput from "../components/NumberInput";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Stock() {
  const {
    stock,
    addStockProduct,
    removeStockProduct,
  } = useFinance();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] =
    useState("");

  async function handleAdd(event) {
    event.preventDefault();

    if (
      !name.trim() ||
      Number(quantity) <= 0 ||
      Number(purchasePrice) < 0
    ) {
      return;
    }

    await addStockProduct(
      name,
      quantity,
      purchasePrice
    );

    setName("");
    setQuantity("");
    setPurchasePrice("");
  }

  const availableCount = stock.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0),
    0
  );

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć "${product.name}" ze składu?`
    );

    if (!confirmed) {
      return;
    }

    await removeStockProduct(product.id);
  }

  return (
    <section>
      <div className="page-heading">
        <span className="section-label">
          SKŁAD
        </span>

        <h2>Dostępne produkty</h2>
      </div>

      <form
        className="operation-form stock-add-form"
        onSubmit={handleAdd}
      >
        <input
          type="text"
          placeholder="Nazwa produktu"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <NumberInput
          min="1"
          step="1"
          placeholder="Ilość"
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
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

        <button
          className="action-button primary"
          type="submit"
        >
          ＋ Dodaj do składu
        </button>
      </form>

      <div className="stock-info">
        <div className="stock-info-card">
          <span>PRODUKTY</span>

          <strong>
            {stock.length}
          </strong>
        </div>

        <div className="stock-info-card">
          <span>DOSTĘPNE SZTUKI</span>

          <strong>
            {availableCount}
          </strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">
              DOSTĘPNE
            </span>

            <h2>Skład</h2>
          </div>
        </div>

        <div className="operations">
          {stock.length === 0 ? (
            <p className="empty-state">
              Brak produktów w składzie.
            </p>
          ) : (
            stock.map((product) => {
              const quantity =
                Number(product.quantity || 0);

              const sold = quantity === 0;

              return (
                <div
                  className="operation stock-operation"
                  key={product.id}
                >
                  <div
                    className={`operation-icon ${
                      sold
                        ? "expense"
                        : "income"
                    }`}
                  >
                    {sold ? "✓" : quantity}
                  </div>

                  <div className="operation-info">
                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      Cena zakupu:{" "}
                      {formatCurrency(
                        product.purchase_price
                      )}
                    </span>
                  </div>

                  <span
                    className={
                      sold
                        ? "stock-sold"
                        : "stock-available"
                    }
                  >
                    {sold
                      ? "SPRZEDANO"
                      : `${quantity} szt.`}
                  </span>

                  <button
                    className="stock-delete"
                    type="button"
                    onClick={() =>
                      handleDelete(product)
                    }
                    title="Usuń produkt ze składu"
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

export default Stock;