import React from "react";
import "../../../style/scss/components/Pos Components/Pos_Function.scss";
import PropTypes from "prop-types";

const Pos_Function = () => {
  return (
    <div className="col-span-4 grid grid-cols-2 gap-1 h-full">
      <button className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Void Line
      </button>
      <button className="bg-purple-800 hover:bg-purple-900 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Void All
      </button>
      <button className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Price Check
      </button>
      <button className="bg-indigo-800 hover:bg-indigo-900 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Print Last Bill
      </button>
      <button className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Suspend Transaction
      </button>
      <button className="bg-purple-800 hover:bg-purple-900 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-md hover:shadow-lg">
        Recall Transaction
      </button>
    </div>
  );
};

Pos_Function.propTypes = {
  activeTab: PropTypes.oneOf(["category", "quick"]).isRequired,
};

export default Pos_Function;
