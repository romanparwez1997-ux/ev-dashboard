import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * DataTable
 * props:
 *  - data: array of raw CSV-parsed objects
 */
export default function DataTable({ data = [] }) {
  // displayed columns (pick columns commonly useful for EV dataset)
  const preferredCols = [
    "Make",
    "Model",
    "Model Year",
    "Electric Vehicle Type",
    "Electric Range",
    "City",
    "State",
    "VIN (1-10)",
  ];

  const availableCols = useMemo(() => {
    if (!data || data.length === 0) return [];
    // choose preferredCols that exist in the dataset, then append some other keys if needed
    const keys = Object.keys(data[0] || {});
    const cols = preferredCols.filter((c) => keys.includes(c));
    // add any other columns up to a reasonable amount
    for (const k of keys) {
      if (!cols.includes(k) && cols.length < 10) cols.push(k);
    }
    return cols;
  }, [data]);

  // Filters & pagination state
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // derive unique options
  const makes = useMemo(() => {
    const s = new Set(data.map((r) => r.Make).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [data]);

  const types = useMemo(() => {
    const s = new Set(
      data.map((r) => r["Electric Vehicle Type"]).filter(Boolean)
    );
    return ["All", ...Array.from(s)];
  }, [data]);

  // filteredData memoized
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      // search across displayed columns
      const matchesSearch =
        q === "" ||
        availableCols.some((col) =>
          String(row[col] || "").toLowerCase().includes(q)
        );

      const matchesMake = makeFilter === "All" || row.Make === makeFilter;
      const matchesType =
        typeFilter === "All" ||
        row["Electric Vehicle Type"] === typeFilter;

      return matchesSearch && matchesMake && matchesType;
    });
  }, [data, search, makeFilter, typeFilter, availableCols]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setMakeFilter("All");
    setTypeFilter("All");
    setPage(1);
  };

  // CSV export (filteredData)
  const exportCSV = () => {
    if (!filteredData.length) {
      alert("No rows to export");
      return;
    }
    const cols = availableCols;
    const header = cols.join(",");
    const rowsText = filteredData.map((row) =>
      cols
        .map((c) => {
          const v = row[c] ?? "";
          // escape double quotes by doubling them
          const escaped = String(v).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    const csvContent = [header, ...rowsText].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `ev_data_filtered_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Excel export
  const exportExcel = () => {
    if (!filteredData.length) {
      alert("No rows to export");
      return;
    }
    // build sheet from filteredData with only availableCols
    const sheetData = filteredData.map((row) => {
      const out = {};
      availableCols.forEach((c) => (out[c] = row[c] ?? ""));
      return out;
    });
    const worksheet = XLSX.utils.json_to_sheet(sheetData, { header: availableCols });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EV Data");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `ev_data_filtered_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // PDF export (table + filters summary)
  const exportPDF = () => {
    if (!filteredData.length) {
      alert("No rows to export");
      return;
    }
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFontSize(18);
    doc.text("Electric Vehicle Dataset Report", 40, 40);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
    doc.text(`Filters -> Make: ${makeFilter}, Type: ${typeFilter}, Search: ${search || "None"}`, 40, 80);

    // autoTable expects arrays
    const head = [availableCols];
    const body = filteredData.map((row) =>
      availableCols.map((c) => String(row[c] ?? ""))
    );

    doc.autoTable({
      startY: 100,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 144, 255] },
      pageBreak: "auto",
      margin: { left: 20, right: 20 },
    });

    doc.save(`ev_data_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // UI - show message when no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <p className="text-gray-600 dark:text-gray-300">No data loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex gap-2 items-center">
          <input
            aria-label="Search"
            type="text"
            placeholder="Search (Make / Model / City / ...)"
            className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={makeFilter}
            onChange={(e) => {
              setMakeFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          >
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Export CSV
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {availableCols.map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`${
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-700"
                } hover:bg-blue-50 dark:hover:bg-blue-900`}
              >
                {availableCols.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 align-top"
                  >
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination + counts */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
          {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} filtered (total {data.length})
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
