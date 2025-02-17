import React from "react";
import { Search } from "lucide-react";
import "../../../style/scss/components/Pos Components/Pos_Calculator.scss";

export const Pos_Calculator = () => {
    return (
        <div className="col-span-4 bg-gray-800 rounded-xl p-4 shadow-xl">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 py-2 text-base bg-gray-700 border-gray-600 rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="bg-gray-700 p-4 rounded-lg mb-4 min-h-100 flex items-center justify-end">
                {/* Display default text as placeholder */}
                <div className="text-right text-3xl font-mono text-white w-full">
                    {"No item selected"}
                </div>
            </div>

            <div className="bg-white text-black p-4 rounded-lg shadow-inner">
                <div className="space-y-3 text-sm">
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
