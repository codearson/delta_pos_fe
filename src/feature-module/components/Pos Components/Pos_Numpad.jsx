import React from "react";
import "../../../style/scss/components/Pos Components/Pos_Numpad.scss";

const Pos_Numpad = () => {
  return (
    <div className="col-span-5 p-2 rounded-lg bg-custom backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-1">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, "00", 0, "."].map((num) => (
          <button key={num} className="bg-white text-gray-900 hover-bg-light p-15 rounded-md text-sm font-bold transition-colors shadow-sm hover-shadow-md">
            {num}
          </button>
        ))}
        <button className="bg-red text-white p-15 rounded-md text-sm font-bold transition-colors shadow-sm hover-shadow-md">C</button>
        <button className="bg-blue text-white p-15 rounded-md text-sm font-bold transition-colors shadow-sm hover-shadow-md">×</button>
        <button className="bg-green text-white p-15 rounded-md text-sm font-bold transition-colors shadow-sm hover-shadow-md">Enter</button>
      </div>
    </div>
  );
};

export default Pos_Numpad;
