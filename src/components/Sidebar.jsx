function Sidebar({ page, setPage }) {
  const menu = [
    { id: "dashboard", label: "Dashboard" },
    { id: "sales", label: "Sprzedaż" },
    { id: "expenses", label: "Wydatki" },
    { id: "reports", label: "Raporty" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">F</div>
        <span>Finansowy</span>
      </div>

      <nav className="navigation">
        {menu.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              page === item.id ? "active" : ""
            }`}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        className={`nav-item settings ${
          page === "settings" ? "active" : ""
        }`}
        onClick={() => setPage("settings")}
      >
        Ustawienia
      </button>
    </aside>
  );
}

export default Sidebar;