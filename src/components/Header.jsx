import {
  getCurrentDate,
  getCurrentWeekday,
} from "../utils/date";

function Header({ page }) {
  const titles = {
    dashboard: {
      label: "DASHBOARD",
      title: "Finanse",
    },

    sales: {
      label: "SPRZEDAŻ",
      title: "Sprzedaż",
    },

    expenses: {
      label: "WYDATKI",
      title: "Wydatki",
    },

    stock: {
      label: "SKŁAD",
      title: "Skład",
    },

    reports: {
      label: "RAPORTY",
      title: "Raporty",
    },

    settings: {
      label: "USTAWIENIA",
      title: "Ustawienia",
    },
  };

  const current =
    titles[page] ||
    titles.dashboard;

  return (
    <header className="header">
      <div>
        <span className="section-label">
          {current.label}
        </span>

        <h1>
          {current.title}
        </h1>
      </div>

      <div className="current-date">
        <strong>
          {getCurrentDate()}
        </strong>

        <span>
          {getCurrentWeekday()}
        </span>
      </div>
    </header>
  );
}

export default Header;