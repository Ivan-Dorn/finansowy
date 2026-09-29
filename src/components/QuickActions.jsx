function QuickActions({ setPage }) {
  return (
    <div className="quick-actions">
      <button
        className="action-button primary"
        onClick={() => setPage("sales")}
      >
        ＋ Dodaj sprzedaż
      </button>

      <button
        className="action-button"
        onClick={() => setPage("expenses")}
      >
        − Dodaj wydatek
      </button>
    </div>
  );
}

export default QuickActions;