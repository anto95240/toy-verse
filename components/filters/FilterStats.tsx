import React from "react";

export const FilterStats = ({
  totalToys,
  totalWithYear,
}: {
  totalToys: number;
  totalWithYear: number;
}) => (
  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
    <h3 className="font-semibold text-text-prim text-sm flex items-center mb-3">
      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
      Statistiques
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{totalToys}</div>
        <div className="text-xs text-gray-600">Total jouets</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{totalWithYear}</div>
        <div className="text-xs text-gray-600">Avec année</div>
      </div>
    </div>
  </div>
);
