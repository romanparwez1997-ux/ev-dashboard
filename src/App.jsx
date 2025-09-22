import { useEffect, useState } from "react";
import Papa from "papaparse";
import SummaryCards from "./components/SummaryCards";
import EVTypePieChart from "./components/EVTypePieChart";
import TopMakesBarChart from "./components/TopMakesBarChart";
import YearlyTrendLineChart from "./components/YearlyTrendLineChart";
import DataTable from "./components/DataTable";
import ThemeToggle from "./components/ThemeToggle";
import { motion } from "framer-motion";

function App() {
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    make: "All",
    type: "All",
  });

  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    Papa.parse("/Electric_Vehicle_Population_Data.csv", {
      download: true,
      header: true,
      complete: (result) => {
        setRawData(result.data);
      },
    });
  }, []);

  // 🔹 Apply filters to rawData
  const filteredData = rawData.filter((row) => {
    const matchSearch =
      row.Make?.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.Model?.toLowerCase().includes(filters.search.toLowerCase());
    const matchMake = filters.make === "All" || row.Make === filters.make;
    const matchType =
      filters.type === "All" || row["Electric Vehicle Type"] === filters.type;
    return matchSearch && matchMake && matchType;
  });

  // 🔹 Compute summary + chart data from filteredData
  const buildSummary = (rows) => {
    let total_evs = rows.length;
    let total_range = 0;
    let range_count = 0;

    let top_makes = {};
    let ev_type_distribution = {};
    let yearly_distribution = {};

    rows.forEach((row) => {
      // Avg range
      if (row["Electric Range"]) {
        const r = parseFloat(row["Electric Range"]);
        if (!isNaN(r)) {
          total_range += r;
          range_count++;
        }
      }

      // Top makes
      const make = row.Make || "Unknown";
      top_makes[make] = (top_makes[make] || 0) + 1;

      // EV type
      const evType = row["Electric Vehicle Type"] || "Unknown";
      ev_type_distribution[evType] =
        (ev_type_distribution[evType] || 0) + 1;

      // Year
      const year = row["Model Year"] || "Unknown";
      yearly_distribution[year] = (yearly_distribution[year] || 0) + 1;
    });

    // Sort makes → top 5
    const sortedMakes = Object.entries(top_makes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const top_makes_final = {};
    sortedMakes.forEach(([k, v]) => (top_makes_final[k] = v));

    return {
      total_evs,
      average_range: range_count ? total_range / range_count : 0,
      top_makes: top_makes_final,
      ev_type_distribution,
      yearly_distribution,
    };
  };

  const summaryData = buildSummary(filteredData);

  if (rawData.length === 0) return <p className="p-6">Loading data...</p>;

  if (!summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EV Dashboard ⚡</h1>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SummaryCards data={summaryData} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <EVTypePieChart data={summaryData.ev_type_distribution} dark={dark} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <TopMakesBarChart data={summaryData.top_makes} dark={dark} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6"
      >
        <YearlyTrendLineChart data={summaryData.yearly_distribution} dark={dark}/>
      </motion.div>

      {/* 🔹 Table controls filtering state */}
      <DataTable data={filteredData} filters={filters} setFilters={setFilters} />
    </div>
  );
}

export default App;
