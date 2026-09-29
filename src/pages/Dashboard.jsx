import FinanceSummary from "../components/FinanceSummary";
import FinanceChart from "../components/FinanceChart";
import OperationsList from "../components/OperationsList";
import QuickActions from "../components/QuickActions";

function Dashboard({ setPage }) {
  return (
    <>
      <FinanceSummary />

      <div className="dashboard-grid">
        <FinanceChart />
        <OperationsList />
      </div>

      <QuickActions setPage={setPage} />
    </>
  );
}

export default Dashboard;