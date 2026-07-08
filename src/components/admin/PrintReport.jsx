import React from "react";

const PrintReport = ({ title, subtitle, tables = [] }) => {
  return (
    <div className="print-section bg-white text-black p-6">
      <div className="mb-6 border-b border-gray-300 pb-3">
        <h1 className="text-2xl font-bold text-left">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 text-left">{subtitle}</p>
        )}
      </div>

      {tables.map((table, ti) => (
        <div key={ti} className="mb-6">
          {table.title && (
            <h2 className="text-base font-semibold text-left mb-2 text-gray-800">
              {table.title}
            </h2>
          )}
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-200">
                {table.headers.map((h, i) => (
                  <th
                    key={i}
                    className="border border-gray-400 px-3 py-2 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className="even:bg-gray-50">
                  {Array.isArray(row) ? (
                    row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="border border-gray-300 px-3 py-2 text-left"
                      >
                        {cell}
                      </td>
                    ))
                  ) : (
                    <td
                      colSpan={table.headers.length}
                      className="border border-gray-300 px-3 py-2 text-left font-medium"
                    >
                      {row}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PrintReport;
