import React, { useEffect, useState } from "react";
//import Breadcrumbs from "../../core/breadcrumbs";
import "react-datepicker/dist/react-datepicker.css";
import StockadjustmentModal from "../../core/modals/stocks/stockadjustmentModal";
import { getAllManagerToggles, updateManagerToggleStatus } from "../Api/ManagerToggle";

const styles = `
  .nav-tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-tabs-container {
    display: flex;
    align-items: center;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin-left: 20px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ff4444;
    transition: .4s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #00C851;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-label {
    margin-right: 10px;
    line-height: 20px;
    color: #333;
    font-weight: 500;
    font-size: 14px;
  }

  .toggle-wrapper {
    display: flex;
    align-items: center;
  }

  /* Manual Discount card styling */
  .card.mb-4 {
    margin-bottom: 0.5rem !important;
  }

  .card.mb-4 .card-body {
    padding: 0.75rem 1rem;
  }

  .card.mb-4 .card-title {
    margin-bottom: 0;
    font-size: 1rem;
    line-height: 1.2;
  }

  .card.mb-4 .d-flex {
    margin-bottom: 0 !important;
  }
`;

const StockAdjustment = () => {
  const [toggles, setToggles] = useState([]);

  useEffect(() => {
    const fetchToggles = async () => {
      try {
        const toggles = await getAllManagerToggles();
        setToggles(toggles.responseDto);
      } catch (error) {
        console.error('Error fetching toggles:', error);
      }
    };
    
    fetchToggles();
  }, []);

  const handleToggleChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateManagerToggleStatus(id, newStatus);
      setToggles(prevToggles => 
        prevToggles.map(toggle => 
          toggle.id === id ? { ...toggle, isActive: newStatus } : toggle
        )
      );
    } catch (error) {
      console.error('Error updating toggle status:', error);
    }
  };

  return (
    <div className="page-wrapper">
      <style>{styles}</style>
      <div className="content">
        <div className="row">
          {toggles.map((toggle) => (
            <div key={toggle.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{toggle.action}</h5>
                    <div className="toggle-wrapper">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={toggle.isActive} 
                          onChange={() => handleToggleChange(toggle.id, toggle.isActive)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <StockadjustmentModal />
      </div>
    </div>
  );
};

export default StockAdjustment;
