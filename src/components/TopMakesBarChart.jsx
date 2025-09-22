import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const LIGHT_BAR_COLOR = "#3b82f6"; // blue
const DARK_BAR_COLOR = "#60a5fa"; // lighter blue for dark mode

const tooltipStyle = {
  backgroundColor: "#1e293b", // dark slate
  borderRadius: 4,
  padding: 8,
  color: "#e2e8f0",
  fontWeight: "bold",
};

export default function TopMakesBarChart({ data, dark }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    make: key,
    count: value,
  }));

  return (
    <div className={`p-6 rounded-2xl shadow-lg ${dark ? "bg-gray-900" : "bg-white"}`}>
      <h2 className={`text-xl font-semibold mb-4 ${dark ? "text-gray-300" : "text-gray-900"}`}>
        Top Manufacturers
      </h2>

      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#ccc"} />
        <XAxis
          dataKey="make"
          stroke={dark ? "#cbd5e1" : "#374151"}
          tick={{ fill: dark ? "#cbd5e1" : "#374151" }}
        />
        <YAxis stroke={dark ? "#cbd5e1" : "#374151"} tick={{ fill: dark ? "#cbd5e1" : "#374151" }} />
        <Tooltip
          contentStyle={tooltipStyle}
          wrapperStyle={{ zIndex: 1000 }}
          cursor={{ fill: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
        />
        <Legend wrapperStyle={{ color: dark ? "#cbd5e1" : "#374151", fontWeight: "bold" }} />
        <Bar dataKey="count" fill={dark ? DARK_BAR_COLOR : LIGHT_BAR_COLOR} />
      </BarChart>
    </div>
  );
}
