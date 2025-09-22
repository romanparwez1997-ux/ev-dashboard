import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const LIGHT_LINE_COLOR = "#10b981"; // green
const DARK_LINE_COLOR = "#34d399";  // lighter green for dark mode

const tooltipStyle = {
  backgroundColor: "#1e293b", // dark slate
  borderRadius: 4,
  padding: 8,
  color: "#e2e8f0",
  fontWeight: "bold",
};

export default function YearlyTrendLineChart({ data, dark }) {
  const chartData = Object.entries(data).map(([year, value]) => ({
    year,
    count: value,
  }));

  return (
    <div className={`p-6 rounded-2xl shadow-lg ${dark ? "bg-gray-900" : "bg-white"}`}>
      <h2 className={`text-xl font-semibold mb-4 ${dark ? "text-gray-300" : "text-gray-900"}`}>
        EV Growth Over Years
      </h2>

      <LineChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#ccc"} />
        <XAxis
          dataKey="year"
          stroke={dark ? "#cbd5e1" : "#374151"}
          tick={{ fill: dark ? "#cbd5e1" : "#374151" }}
        />
        <YAxis
          stroke={dark ? "#cbd5e1" : "#374151"}
          tick={{ fill: dark ? "#cbd5e1" : "#374151" }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          wrapperStyle={{ zIndex: 1000 }}
          cursor={{ stroke: dark ? "#34d399" : "#10b981", strokeWidth: 2 }}
        />
        <Legend wrapperStyle={{ color: dark ? "#cbd5e1" : "#374151", fontWeight: "bold" }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={dark ? DARK_LINE_COLOR : LIGHT_LINE_COLOR}
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: dark ? DARK_LINE_COLOR : LIGHT_LINE_COLOR }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </div>
  );
}
