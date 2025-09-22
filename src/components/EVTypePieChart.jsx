import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const LIGHT_COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444"]; // blue, orange, green, red
const DARK_COLORS = ["#60a5fa", "#fb923c", "#34d399", "#f87171"]; // lighter tones for dark bg

const tooltipStyle = {
  backgroundColor: "#1e293b", // dark slate
  borderRadius: 4,
  padding: 8,
  color: "#e2e8f0",
  fontWeight: "bold",
};

export default function EVTypePieChart({ data, dark }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
  }));

  // Choose colors array based on mode
  const COLORS = dark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div className={`p-6 rounded-2xl shadow-lg ${dark ? "bg-gray-900" : "bg-white"}`}>
      <h2 className={`text-xl font-semibold mb-4 ${dark ? "text-gray-300" : "text-gray-900"}`}>
        EV Types
      </h2>

      <PieChart width={400} height={300}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={{ fill: dark ? "#e2e8f0" : "#1f2937" }}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          contentStyle={tooltipStyle}
          wrapperStyle={{ zIndex: 1000 }}
          cursor={{ fill: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        />

        <Legend
          wrapperStyle={{ color: dark ? "#cbd5e1" : "#374151", fontWeight: "bold" }}
        />
      </PieChart>
    </div>
  );
}
