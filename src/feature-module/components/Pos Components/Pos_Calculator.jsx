import React from "react";
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = () => {
    return (
      <div className="col-span-4 bg-gray-800 rounded-xl p-4 shadow-xl">
        <div className="w-full search-set relative mb-2 bar flex items-center  bg-white rounded-lg overflow-hidden">
          <input
              type="search"
              placeholder="Search"
            />
            <span className="search-icon px-3 text-gray-400">
              <i className="feather-search" />
            </span>
        </div>

        <div className="bg-white text-black p-4 mb-2 rounded-lg shadow-inner w-10">
            
        </div>

        <div className="bg-white text-black p-4 rounded-lg shadow-inner">
          <div className="space-y-3 ">
            <div className="flex justify-between">
              <span className="font-medium">QTY</span>
              <span>N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sub Total</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cash Back</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Discount</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Balance</span>
              <span>$0.00</span>
            </div>
            <div className="line" >
                </div> 
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Pos_Calculator;
