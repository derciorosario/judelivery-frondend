import React, { useState } from 'react';
import Icon from './Icon';
import { SIMULATED_LOCATIONS } from '../../data/mockData';


// ─── LOCATION SEARCH INPUT ─────────────────────────────────────────────────────
const LocationSearchInput = ({ value, onChange, placeholder, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredLocations = SIMULATED_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (location) => {
    onSelect(location);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      {showSuggestions && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full px-3 text-gray-900 py-2 text-left text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                {loc}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">Nenhum resultado encontrado</div>
          )}
        </div>
      )}
    </div>
  );
};


export default LocationSearchInput;