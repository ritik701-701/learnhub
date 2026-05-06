const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition">
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
