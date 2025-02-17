import React from "react";
import "../../../style/scss/components/Pos Components/Pos_Numpad.scss";

const Pos_Numpad = () => {
  return (
    <div className="col-span-5 p-4 rounded-xl bg-custom backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-1">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, "00", 0, "."].map((num) => (
          <button key={num} className="bg-white text-gray-900 hover-bg-light p-2 rounded-lg text-base font-bold transition-colors shadow-md hover-shadow-lg">
            {num}
          </button>
        ))}
        <button className="bg-red text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover-shadow-lg">C</button>
        <button className="bg-blue text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover-shadow-lg">×</button>
        <button className="bg-green text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover-shadow-lg">Enter</button>
      </div>
    </div>
  );
};

export default Pos_Numpad;
