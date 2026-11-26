
import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ title, value, percentage, type, icon: Icon }) {
  const isPositive = type === "positive";

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>

        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <h2>{value}</h2>

      <div className={`stat-change ${isPositive ? "positive" : "negative"}`}>
        {isPositive ? (
          <TrendingUp size={16} />
        ) : (
          <TrendingDown size={16} />
        )}

        <span>{percentage}</span>
        <span className="stat-period"> em relação ao mês anterior</span>
      </div>
    </div>
  );
}

export default StatCard;
