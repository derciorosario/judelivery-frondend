const StatusToggle = ({ online, setOnline }) => {
  return (
    <div className={`rounded-2xl p-4 flex items-center justify-between ${online ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-slate-500 to-slate-600"} text-white`}>
      <div>
        <p className="text-xs font-semibold opacity-80">Estado Actual</p>
        <p className="text-xl font-bold mt-0.5">{online ? "Online 🟢" : "Offline 🔴"}</p>
        <p className="text-xs opacity-75">Toque para alterar</p>
      </div>
      <button
        onClick={() => setOnline(!online)}
        className={`w-14 h-7 rounded-full relative transition-all ${online ? "bg-white/30" : "bg-white/20"}`}
      >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${online ? "left-7" : "left-0.5"}`} />
      </button>
    </div>
  );
};

export default StatusToggle;