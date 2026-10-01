import { useState } from "react";
import CustomSelect from "../components/CustomSelect";
import NumberInput from "../components/NumberInput";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Sales() {
  const {
    operations,
    stock,
    sellStockProduct,
    removeOperation,
  } = useFinance();

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [salePrice, setSalePrice] =
    useState("");

  const sales = operations.filter(
    (operation) =>
      operation.type === "income"
  );

  const selected =
    stock.find(
      (product) =>
        product.id === selectedProduct
    );

  const productOptions = [
    {
      value: "",
      label: "Wybierz produkt ze składu",
      isPlaceholder: true,
    },
    ...stock
      .filter(
        (product) =>
          Number(product.quantity) > 0
      )
      .map((product) => ({
        value: product.id,
        label: product.name,
        badge: `${product.quantity} szt.`,
      })),
  ];

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !selectedProduct ||
      !selected ||
      Number(quantity) <= 0 ||
      Number(quantity) >
        Number(selected.quantity) ||
      Number(salePrice) <= 0
    ) {
      return;
    }

    await sellStockProduct(
      selectedProduct,
      quantity,
      salePrice
    );

    setSelectedProduct("");
    setQuantity("1");
    setSalePrice("");
  }

  return (
    <section>
      <div className="page-heading">
        <span className="section-label">
          SPRZEDAŻ
        </span>

        <h2>Dodaj sprzedaż</h2>
      </div>

      <form
        className="operation-form sales-from-stock-form"
        onSubmit={handleSubmit}
      >
        <CustomSelect
          value={selectedProduct}
          onChange={(val) =>
            setSelectedProduct(val)
          }
          options={productOptions}
          placeholder="Wybierz produkt ze składu"
        />

        <NumberInput
          min="1"
          max={
            selected
              ? selected.quantity
              : undefined
          }
          value={quantity}
          onChange={(event) =>
            setQuantity(
              event.target.value
            )
          }
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Cena sprzedaży"
          value={salePrice}
          onChange={(event) =>
            setSalePrice(
              event.target.value
            )
          }
        />

        <button
          className="action-button primary"
          type="submit"
        >
          ＋ Sprzedaj
        </button>
      </form>

      {selected && (
        <div className="selected-product">
          <div>
            <span>PRODUKT</span>
            <strong>
              {selected.name}
            </strong>
          </div>

          <div>
            <span>DOSTĘPNE</span>
            <strong>
              {selected.quantity} szt.
            </strong>
          </div>

          <div>
            <span>KOSZT ZAKUPU</span>
            <strong>
              {formatCurrency(
                selected.purchase_price
              )}
            </strong>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">
              HISTORIA
            </span>

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
              const purchase =
                Number(
                  sale.purchasePrice ?? 0
                );

              const selling =
                Number(
                  sale.salePrice ??
                    sale.amount ??
                    0
                );

              const profit =
                selling - purchase;

              return (
                <div
                  className="operation"
                  key={sale.id}
                >
                  <div className="operation-icon income">
                    +
                  </div>

                  <div className="operation-info">
                    <strong>
                      {sale.name}
                    </strong>

                    <span>
                      Zakup:{" "}
                      {formatCurrency(
                        purchase
                      )}
                      {" • "}
                      Sprzedaż:{" "}
                      {formatCurrency(
                        selling
                      )}
                      {" • "}
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
                    {profit >= 0
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      Math.abs(profit)
                    )}
                  </strong>

                  <button
                    className="operation-delete"
                    type="button"
                    onClick={() =>
                      removeOperation(
                        sale.id
                      )
                    }
                    title="Usuń sprzedaż"
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