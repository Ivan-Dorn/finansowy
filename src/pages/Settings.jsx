import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

function Settings({
  backgroundImage,
  onBackgroundChange,
  onRemoveBackground,
  onLogout,
}) {
  const {
    startingBalance,
    setStartingBalance,
    finances,
  } = useFinance();

  return (
    <section className="settings-page">
      <div className="page-heading">
        <span className="section-label">USTAWIENIA</span>
        <h2>Ustawienia</h2>
      </div>

      <div className="settings-layout">
        <div className="glass-settings-card">
          <div className="settings-card-top">
            <div>
              <span className="glass-small-label">
                FINANSE
              </span>

              <h3>Kapitał początkowy</h3>
            </div>
          </div>

          <p>
            Ustaw kwotę, od której zaczynasz prowadzenie
            finansów.
          </p>

          <div className="starting-balance-row">
            <input
              type="number"
              min="0"
              step="0.01"
              value={startingBalance}
              onChange={(event) =>
                setStartingBalance(
                  Number(event.target.value) || 0
                )
              }
            />

            <span>PLN</span>
          </div>

          <div className="settings-current">
            <span>STAN TERAZ</span>

            <strong>
              {formatCurrency(finances.currentBalance)}
            </strong>
          </div>
        </div>

        <div className="glass-settings-card">
          <div className="settings-card-top">
            <div>
              <span className="glass-small-label">
                WYGLĄD
              </span>

              <h3>Zdjęcie tła</h3>
            </div>
          </div>

          <p>
            Wybierz własne zdjęcie. Zostanie ustawione jako
            tło całej aplikacji.
          </p>

          <div
            className="background-preview"
            style={
              backgroundImage
                ? {
                    backgroundImage: `url("${backgroundImage}")`,
                  }
                : {}
            }
          >
            {!backgroundImage && (
              <div className="preview-empty">
                Brak własnego zdjęcia
              </div>
            )}
          </div>

          <div className="background-actions">
            <label className="glass-upload-button">
              Wybierz zdjęcie

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  onBackgroundChange(
                    event.target.files?.[0]
                  )
                }
              />
            </label>

            {backgroundImage && (
              <button
                className="glass-remove-button"
                type="button"
                onClick={onRemoveBackground}
              >
                Usuń tło
              </button>
            )}
          </div>

          <button
            className="glass-remove-button"
            type="button"
            onClick={onLogout}
            style={{ marginTop: "12px" }}
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;