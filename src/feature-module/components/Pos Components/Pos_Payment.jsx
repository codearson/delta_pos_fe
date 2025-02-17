import React from "react";
import "../../../style/scss/components/Pos Components/Pos_Payment.scss";

const Pos_Payment = () => {
  return (
    <div className="col-span-3 grid grid-rows-2 gap-1">
      <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg">
        Cash
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg">
        Card
      </button>
    </div>
  );
};

export default Pos_Payment;
