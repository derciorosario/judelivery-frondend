import React from 'react';
import Icon from './Icon';

const StatCard = ({ label, value, sub, color = "orange" }) => {
  const colors = { orange: "bg-orange-500", blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500" };
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className={`w-8 h-1 rounded-full mb-3 ${colors[color]}`} />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-500 mt-1 font-medium">{sub}</p>}
    </div>
  );
};



export default StatCard;