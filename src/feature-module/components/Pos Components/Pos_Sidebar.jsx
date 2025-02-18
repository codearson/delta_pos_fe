import React from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import "../../../style/scss/components/Pos Components/Pos_Sidebar.scss";

const Pos_Sidebar = () => {
  return (
    <aside className="h-screen w-20 bg-blue-123 flex flex-col items-center py-4 shadow-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-pos-rad-blue">Delta POS</h1>
      </div>
      <div className="mt-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-pos-blue flex items-center justify-center text-xl font-bold shadow-lg text-white">
          A
        </div>
        <button className="text-red-500 w-14 h-14 hover:bg-gray-800">
          <Link className="logout pb-0" to="/signIn">
            <ImageWithBasePath
              src="assets/img/icons/log-out.svg"
              alt="img"
              className="me-2"
            />
          </Link>
        </button>
      </div>
    </aside>
  );
};

export default Pos_Sidebar;
