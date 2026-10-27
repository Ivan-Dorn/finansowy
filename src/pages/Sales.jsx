import { useMemo, useState } from "react";
import CustomSelect from "../components/CustomSelect";
import NumberInput from "../components/NumberInput";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Sales({
  setPage,
  initialSelectedProductId,
  onClearInitialProduct,
}) {
  const {
    operations,
    stock,
    sellStockProduct,
    removeOperation,
  } = useFinance();

  const [selectedProduct, setSelectedProduct] = useState(
    () => initialSelectedProductId || ""
  );
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState(() => {
    if (initialSelectedProductId) {
      const prod = stock.find((p) => p.id === initialSelectedProductId);
      if (prod && Number(prod.purchase_price) > 0) {
        return String((Number(prod.purchase_price) * 1.3).toFixed(2));
      }
    }
    return "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'high' | 'low'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list' | 'dropdown'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleSuccessNotice, setSaleSuccessNotice] = useState(null);

  // Filtrowanie produktów, które fizycznie są na stanie (> 0 sztuk)
  const availableStock = useMemo(() => {
    return stock.filter((product) => Number(product.quantity || 0) > 0);
  }, [stock]);

  // Łączna liczba sztuk dostępnych na magazynie
  const totalStockItemsCount = useMemo(() => {
    return availableStock.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );
  }, [availableStock]);

  // Synchronizacja przy zmianie przekazanego z zewnątrz produktu
  const [prevInitialId, setPrevInitialId] = useState(initialSelectedProductId);
  if (initialSelectedProductId !== prevInitialId) {
    setPrevInitialId(initialSelectedProductId);
    if (initialSelectedProductId) {
      setSelectedProduct(initialSelectedProductId);
      setQuantity("1");
      const prod = stock.find((p) => p.id === initialSelectedProductId);
      if (prod && Number(prod.purchase_price) > 0) {
        setSalePrice(String((Number(prod.purchase_price) * 1.3).toFixed(2)));
      }
    }
  }

  // Wybrany produkt
  const selected = stock.find((product) => product.id === selectedProduct);
  const maxAvailable = selected ? Number(selected.quantity || 0) : 0;

  // Filtrowanie produktów według wyszukiwarki i filtra stanu magazynowego
  const filteredStock = useMemo(() => {
    return availableStock.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      if (!matchesSearch) return false;

      const qty = Number(product.quantity || 0);
      if (filterMode === "high") return qty > 3;
      if (filterMode === "low") return qty <= 3;
      return true;
    });
  }, [availableStock, searchQuery, filterMode]);

  // Opcje dla widoku dropdown
  const productOptions = [
    {
      value: "",
      label: "Wybierz produkt ze składu...",
      isPlaceholder: true,
    },
    ...availableStock.map((product) => ({
      value: product.id,
      label: product.name,
      badge: `${product.quantity} szt. • zakup: ${formatCurrency(
        product.purchase_price
      )}`,
    })),
  ];

  // Kliknięcie w produkt na kafelku / liście
  function handleSelectProduct(productId) {
    if (selectedProduct === productId) {
      // Ponowne kliknięcie odznacza
      handleClearSelection();
      return;
    }

    setSelectedProduct(productId);
    setQuantity("1");

    const prod = stock.find((p) => p.id === productId);
    if (prod && Number(prod.purchase_price) > 0) {
      // Sugerowana cena z narzutem 30% dla wygody
      setSalePrice(String((Number(prod.purchase_price) * 1.3).toFixed(2)));
    } else {
      setSalePrice("");
    }
  }

  function handleClearSelection() {
    setSelectedProduct("");
    setQuantity("1");
    setSalePrice("");
    if (onClearInitialProduct) {
      onClearInitialProduct();
    }
  }

  // Szybkie ustawienie marży/ceny
  function applyMarkup(percentage) {
    if (!selected) return;
    const base = Number(selected.purchase_price || 0);
    const newPrice = (base * (1 + percentage / 100)).toFixed(2);
    setSalePrice(String(newPrice));
  }

  // Szybkie przyciski ilości
  const quickQuantityPresets = useMemo(() => {
    if (!selected) return [];
    const max = Number(selected.quantity || 0);
    const presets = [1];
    if (max >= 2 && !presets.includes(2)) presets.push(2);
    if (max >= 5 && !presets.includes(5)) presets.push(5);
    if (max >= 10 && !presets.includes(10)) presets.push(10);
    if (!presets.includes(max) && max > 1) presets.push(max);
    return presets;
  }, [selected]);

  // Kalkulacje na żywo
  const numQuantity = Math.max(1, Number(quantity) || 1);
  const unitPurchase = Number(selected?.purchase_price || 0);
  const unitSale = Number(salePrice) || 0;
  const totalRevenue = unitSale * numQuantity;
  const totalCost = unitPurchase * numQuantity;
  const netProfit = totalRevenue - totalCost;
  const profitMarginPercent =
    totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : null;

  async function handleSubmit(event) {
    if (event) event.preventDefault();

    if (
      !selectedProduct ||
      !selected ||
      Number(quantity) <= 0 ||
      Number(quantity) > Number(selected.quantity) ||
      Number(salePrice) <= 0 ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sellStockProduct(selectedProduct, quantity, salePrice);

      const soldName = selected.name;
      const soldQty = quantity;
      const soldTotal = Number(quantity) * Number(salePrice);
      const soldProfit =
        Number(quantity) *
        (Number(salePrice) - Number(selected.purchase_price || 0));

      setSaleSuccessNotice({
        name: soldName,
        quantity: soldQty,
        total: soldTotal,
        profit: soldProfit,
      });

      handleClearSelection();

      setTimeout(() => {
        setSaleSuccessNotice(null);
      }, 5000);
    } catch (err) {
      console.error("Błąd podczas sprzedaży:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtrowanie operacji sprzedaży do historii
  const sales = operations.filter((operation) => operation.type === "income");

  return (
    <section>
      <div className="page-heading">
        <span className="section-label">SPRZEDAŻ</span>
        <h2>Wybierz towar ze składu i sprzedaj</h2>
      </div>

      {saleSuccessNotice && (
        <div className="sale-success-banner">
          <div>
            ✓ Pomyślnie sprzedano <strong>{saleSuccessNotice.quantity} szt.</strong>{" "}
            towaru <strong>"{saleSuccessNotice.name}"</strong> za łączną kwotę{" "}
            <strong>{formatCurrency(saleSuccessNotice.total)}</strong>. (Zysk:{" "}
            <strong>
              {saleSuccessNotice.profit >= 0 ? "+" : ""}
              {formatCurrency(saleSuccessNotice.profit)}
            </strong>
            )
          </div>
          <button
            type="button"
            className="stock-search-clear"
            onClick={() => setSaleSuccessNotice(null)}
            title="Zamknij"
          >
            ×
          </button>
        </div>
      )}

      {/* SEKCJA 1: NOWE WYBIERANIE TOWARU ZE SKŁADU */}
      <div className="stock-selector-container">
        <div className="stock-selector-toolbar">
          {/* Wyszukiwarka */}
          <div className="stock-search-box">
            <span className="stock-search-icon" aria-hidden="true">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="stock-search-input"
              placeholder="Szukaj towaru po nazwie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="stock-search-clear"
                onClick={() => setSearchQuery("")}
                title="Wyczyść szukanie"
              >
                ×
              </button>
            )}
          </div>

          <div className="stock-toolbar-actions">
            {/* Filtry stanu magazynowego */}
            <div className="stock-filter-pills">
              <button
                type="button"
                className={`stock-pill-btn ${
                  filterMode === "all" ? "is-active" : ""
                }`}
                onClick={() => setFilterMode("all")}
              >
                Wszystkie ({availableStock.length} poz. • {totalStockItemsCount} szt.)
              </button>
              <button
                type="button"
                className={`stock-pill-btn ${
                  filterMode === "high" ? "is-active" : ""
                }`}
                onClick={() => setFilterMode("high")}
                title="Produkty z ilością powyżej 3 szt."
              >
                Stan wysoki (&gt;3)
              </button>
              <button
                type="button"
                className={`stock-pill-btn ${
                  filterMode === "low" ? "is-active" : ""
                }`}
                onClick={() => setFilterMode("low")}
                title="Kończące się zapasy (≤ 3 szt.)"
              >
                Kończące się (≤3)
              </button>
            </div>

            {/* Przełącznik widoku: Kafelki / Lista / Dropdown */}
            <div className="stock-view-toggle">
              <button
                type="button"
                className={`stock-view-btn ${
                  viewMode === "grid" ? "is-active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                title="Widok kafelków (Katalog POS)"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Kafelki
              </button>

              <button
                type="button"
                className={`stock-view-btn ${
                  viewMode === "list" ? "is-active" : ""
                }`}
                onClick={() => setViewMode("list")}
                title="Widok listy"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Lista
              </button>

              <button
                type="button"
                className={`stock-view-btn ${
                  viewMode === "dropdown" ? "is-active" : ""
                }`}
                onClick={() => setViewMode("dropdown")}
                title="Klasyczna lista rozwijana"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                Szybki wybór
              </button>
            </div>
          </div>
        </div>

        {/* SPRAWDZENIE: BRAK TOWARÓW NA STANIE */}
        {availableStock.length === 0 ? (
          <div className="stock-empty-box">
            <p>
              Brak dostępnych produktów na składzie (wszystkie stany = 0 szt.).
            </p>
            {setPage && (
              <button
                type="button"
                className="action-button primary"
                onClick={() => setPage("stock")}
              >
                ＋ Przejdź do składu, aby dodać towary
              </button>
            )}
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="stock-empty-box">
            <p>
              Nie znaleziono produktów pasujących do filtru: "
              {searchQuery || filterMode}"
            </p>
            <button
              type="button"
              className="action-button"
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
              }}
            >
              Wyczyść filtry
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* WIDOK KAFELKÓW (KATALOG POS) */
          <div className="stock-grid">
            {filteredStock.map((product) => {
              const qty = Number(product.quantity || 0);
              const isSelected = product.id === selectedProduct;
              const isLow = qty <= 3;

              return (
                <div
                  key={product.id}
                  className={`stock-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelectProduct(product.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectProduct(product.id);
                    }
                  }}
                >
                  <div className="stock-card-top">
                    <div className="stock-card-icon-wrap" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>

                    <span
                      className={`stock-badge-qty ${
                        isLow ? "low" : "good"
                      }`}
                    >
                      {isLow ? `⚠️ ${qty} szt.` : `● ${qty} szt.`}
                    </span>
                  </div>

                  <strong className="stock-card-name" title={product.name}>
                    {product.name}
                  </strong>

                  <div className="stock-card-cost">
                    Koszt zakupu:{" "}
                    <strong>{formatCurrency(product.purchase_price)}</strong>
                  </div>

                  <div className="stock-card-footer">
                    <span className="stock-card-status-text">
                      {isSelected ? (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Wybrany towar
                        </>
                      ) : (
                        "Kliknij, aby wybrać"
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "list" ? (
          /* WIDOK LISTY */
          <div className="stock-list-container">
            {filteredStock.map((product) => {
              const qty = Number(product.quantity || 0);
              const isSelected = product.id === selectedProduct;
              const isLow = qty <= 3;

              return (
                <div
                  key={product.id}
                  className={`stock-list-item ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => handleSelectProduct(product.id)}
                >
                  <div className="stock-list-info">
                    <span
                      className={`stock-badge-qty ${
                        isLow ? "low" : "good"
                      }`}
                    >
                      {qty} szt.
                    </span>
                    <span className="stock-list-name">{product.name}</span>
                  </div>

                  <div className="stock-list-meta">
                    <span className="stock-list-cost">
                      Koszt zakupu:{" "}
                      <strong>
                        {formatCurrency(product.purchase_price)}
                      </strong>
                    </span>

                    <button
                      type="button"
                      className="stock-list-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(product.id);
                      }}
                    >
                      {isSelected ? "Wybrany ✓" : "Wybierz"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* WIDOK SZYBKIEGO DROPDOWN */
          <div className="stock-dropdown-view">
            <CustomSelect
              value={selectedProduct}
              onChange={(val) => {
                if (val) {
                  handleSelectProduct(val);
                } else {
                  handleClearSelection();
                }
              }}
              options={productOptions}
              placeholder="Wybierz produkt ze składu..."
            />
          </div>
        )}
      </div>

      {/* SEKCJA 2: INTERAKTYWNY PANEL SPRZEDAŻY (PO WYBRANIU TOWARU) */}
      {selected ? (
        <form className="sale-checkout-panel" onSubmit={handleSubmit}>
          <div className="sale-checkout-header">
            <div className="sale-product-highlight">
              <div className="sale-product-icon">📦</div>
              <div className="sale-product-title">
                <h3>{selected.name}</h3>
                <p>
                  Na stanie: <strong>{selected.quantity} szt.</strong> &bull;
                  Koszt zakupu:{" "}
                  <strong>{formatCurrency(selected.purchase_price)}</strong> /
                  szt.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="sale-change-btn"
              onClick={handleClearSelection}
            >
              ✕ Zmień towar
            </button>
          </div>

          <div className="sale-inputs-grid">
            {/* Pole ilości sztuk */}
            <div className="sale-input-group">
              <label>Ilość do sprzedaży (maks. {selected.quantity} szt.)</label>
              <NumberInput
                min="1"
                max={selected.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <div className="sale-quick-presets">
                {quickQuantityPresets.map((qtyPreset) => (
                  <button
                    key={qtyPreset}
                    type="button"
                    className={`sale-preset-btn ${
                      Number(quantity) === qtyPreset ? "highlight" : ""
                    }`}
                    onClick={() => setQuantity(String(qtyPreset))}
                  >
                    {qtyPreset === maxAvailable
                      ? `MAX (${qtyPreset})`
                      : `${qtyPreset} szt.`}
                  </button>
                ))}
              </div>
            </div>

            {/* Pole ceny sprzedaży za sztukę */}
            <div className="sale-input-group">
              <label>Cena sprzedaży za 1 szt. (PLN)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Wpisz cenę sprzedaży..."
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />

              {Number(selected.purchase_price) > 0 && (
                <div className="sale-quick-presets">
                  <button
                    type="button"
                    className="sale-preset-btn"
                    onClick={() => applyMarkup(0)}
                    title="Sprzedaż w cenie zakupu"
                  >
                    Koszt (0%)
                  </button>
                  <button
                    type="button"
                    className="sale-preset-btn highlight"
                    onClick={() => applyMarkup(20)}
                  >
                    +20%
                  </button>
                  <button
                    type="button"
                    className="sale-preset-btn highlight"
                    onClick={() => applyMarkup(50)}
                  >
                    +50%
                  </button>
                  <button
                    type="button"
                    className="sale-preset-btn highlight"
                    onClick={() => applyMarkup(100)}
                  >
                    +100% (2x)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Podgląd kalkulacji finansowej na żywo */}
          <div className="sale-calc-grid">
            <div className="sale-calc-card">
              <span>PRZYCHÓD ŁĄCZNIE</span>
              <strong>{formatCurrency(totalRevenue)}</strong>
              <small>
                {numQuantity} szt. × {formatCurrency(unitSale)}
              </small>
            </div>

            <div className="sale-calc-card">
              <span>KOSZT ZAKUPU ŁĄCZNIE</span>
              <strong>{formatCurrency(totalCost)}</strong>
              <small>
                {numQuantity} szt. × {formatCurrency(unitPurchase)}
              </small>
            </div>

            <div
              className={`sale-calc-card ${
                unitSale > 0
                  ? netProfit >= 0
                    ? "profit-positive"
                    : "profit-negative"
                  : ""
              }`}
            >
              <span>SZACOWANY ZYSK NETTO</span>
              <strong>
                {unitSale > 0 ? (
                  <>
                    {netProfit >= 0 ? "+" : ""}
                    {formatCurrency(netProfit)}
                  </>
                ) : (
                  "—"
                )}
              </strong>
              <small>
                {unitSale > 0 && profitMarginPercent !== null ? (
                  netProfit >= 0 ? (
                    `Marża: +${profitMarginPercent}%`
                  ) : (
                    "⚠️ Sprzedaż poniżej kosztu zakupu"
                  )
                ) : (
                  "Wpisz cenę sprzedaży"
                )}
              </small>
            </div>

            <div className="sale-calc-card">
              <span>ZYSK NA 1 SZTUCE</span>
              <strong
                style={{
                  color:
                    unitSale > 0
                      ? unitSale >= unitPurchase
                        ? "#b5ff3d"
                        : "#ff6b6b"
                      : "white",
                }}
              >
                {unitSale > 0 ? (
                  <>
                    {unitSale >= unitPurchase ? "+" : ""}
                    {formatCurrency(unitSale - unitPurchase)}
                  </>
                ) : (
                  "—"
                )}
              </strong>
              <small>Cena zbytu - Cena zakupu</small>
            </div>
          </div>

          <div className="sale-submit-action">
            <button
              className="sale-final-submit-btn"
              type="submit"
              disabled={
                isSubmitting ||
                numQuantity <= 0 ||
                numQuantity > maxAvailable ||
                unitSale <= 0
              }
            >
              {isSubmitting ? (
                "Przetwarzanie..."
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Sprzedaj {numQuantity} szt. za {formatCurrency(totalRevenue)}
                </>
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* SEKCJA 3: HISTORIA SPRZEDAŻY */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">HISTORIA</span>
            <h2>Zrealizowana sprzedaż</h2>
          </div>
        </div>

        <div className="operations">
          {sales.length === 0 ? (
            <p className="empty-state">Brak historii sprzedaży.</p>
          ) : (
            sales.map((sale) => {
              const purchase = Number(sale.purchasePrice ?? 0);
              const selling = Number(sale.salePrice ?? sale.amount ?? 0);
              const profit = selling - purchase;

              return (
                <div className="operation" key={sale.id}>
                  <div className="operation-icon income">+</div>

                  <div className="operation-info">
                    <strong>{sale.name}</strong>

                    <span>
                      Zakup: {formatCurrency(purchase)}
                      {" • "}
                      Sprzedaż: {formatCurrency(selling)}
                      {" • "}
                      {sale.time}
                    </span>
                  </div>

                  <strong
                    className={
                      profit >= 0 ? "operation-income" : "operation-expense"
                    }
                  >
                    {profit >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(profit))}
                  </strong>

                  <button
                    className="operation-delete"
                    type="button"
                    onClick={() => removeOperation(sale.id)}
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