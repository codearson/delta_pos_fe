import React, { useEffect, useState } from "react";
import { categories, quickAccess } from "../../core/json/Posdata";
import Header from "../components/Pos Components/Pos_Header";
import Sidebar from "../components/Pos Components/Pos_Sidebar";
import Calculator from "../components/Pos Components/Pos_Calculator";
import CategoryTabs from "../components/Pos Components/Pos_CategoryTabs"
import CategoryGrid from "../components/Pos Components/Pos_CategoryGrid"
import Numpad from "../components/Pos Components/Pos_Numpad"
import PaymentButtons from "../components/Pos Components/Pos_Payment"
import FunctionButtons from "../components/Pos Components/Pos_Function"


const Pos = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("category");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-pos-dark text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header currentTime={currentTime} />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            <Calculator />
            <div className="col-span-8 space-y-6">
              <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
              <CategoryGrid items={activeTab === "category" ? categories : quickAccess} />
              <div className="grid grid-cols-12 gap-4">
                <Numpad />
                <PaymentButtons />
                <FunctionButtons activeTab={activeTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;
