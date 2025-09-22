

import { motion } from "framer-motion";

export default function SummaryCards({ data }) {
  if (!data) return null;

  const { total_evs, average_range, top_makes, ev_type_distribution } = data;

  const topMake = top_makes ? Object.keys(top_makes)[0] : "N/A";
  const evTypeCount = ev_type_distribution
    ? Object.keys(ev_type_distribution).length
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {[
        { title: "Total EVs", value: total_evs, color: "text-blue-600" },
        { title: "Average Range", value: `${average_range.toFixed(1)} mi`, color: "text-green-600" },
        { title: "Top Make", value: topMake, color: "text-purple-600" },
        { title: "EV Types", value: evTypeCount, color: "text-red-600" },
      ].map(({ title, value, color }, index) => (
        <motion.div
          key={title}
          variants={cardVariants}
          whileHover={{
            scale: 1.07,
            boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
            transition: { type: "spring", stiffness: 300 }
          }}
          className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg dark:shadow-none transition duration-300"
          custom={index}
        >
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {title}
          </h2>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

