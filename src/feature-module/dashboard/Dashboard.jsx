import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  DollarSign,
  TrendingUp,
  Send,
  CreditCard,
  ShoppingBag,
} from "feather-icons-react/build/IconComponents";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { ArrowRight } from "react-feather";
import { all_routes } from "../../Router/all_routes";
import { fetchXReport } from "../Api/TransactionApi";
import { getAllByZReports } from "../Api/SalesReport";
import { fetchProducts } from "../Api/productApi";
import './dashboard.css';  // We'll create this CSS file next

const Dashboard = () => {
  const route = all_routes;
  const [xReportData, setXReportData] = useState({
    totalSales: 0,
    totalTransactions: 0
  });
  const [zReportData, setZReportData] = useState({
    totalTransactions: 0,
    fullyTotalSales: 0
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [activeStockTab, setActiveStockTab] = useState("low"); // State for active stock tab

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        // Fetch X Report data
        const xReportResponse = await fetchXReport();
        if (xReportResponse.success && xReportResponse.data && xReportResponse.data.responseDto) {
          setXReportData({
            totalSales: xReportResponse.data.responseDto.totalSales || 0,
            totalTransactions: xReportResponse.data.responseDto.totalTransactions || 0
          });
        }

        // Fetch Z Report data
        const zReportResponse = await getAllByZReports();
        if (zReportResponse && zReportResponse.length > 0) {
          // Get the last record (most recent)
          const lastRecord = zReportResponse[zReportResponse.length - 1];
          setZReportData({
            totalTransactions: lastRecord.salesDateDetails?.[0]?.totalTransactions || 0,
            fullyTotalSales: lastRecord.fullyTotalSales || 0
          });
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setStockLoading(true);
        const products = await fetchProducts();
        if (Array.isArray(products)) {
          const lowStock = products.filter(
            (product) =>
              product.isActive === true &&
              product.quantity < product.lowStock &&
              product.quantity > 0
          );
          setLowStockProducts(lowStock);
          
          const outOfStock = products.filter(
            (product) => product.isActive === true && product.quantity === 0
          );
          setOutOfStockProducts(outOfStock);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setStockLoading(false);
      }
    };

    loadStockData();
  }, []);

  const handleStockTabChange = (tab) => {
    setActiveStockTab(tab);
  };

  const [chartOptions] = useState({
    series: [
      {
        name: "Sales",
        data: [130, 210, 300, 290, 150, 50, 210, 280, 105],
      },
      {
        name: "Purchase",
        data: [-150, -90, -50, -180, -50, -70, -100, -90, -105],
      },
    ],
    colors: ["#28C76F", "#EA5455"],
    chart: {
      type: "bar",
      height: 320,
      stacked: true,
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 280,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: "end", // "around" / "end"
        borderRadiusWhenStacked: "all", // "all"/"last"
        columnWidth: "20%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      min: -200,
      max: 300,
      tickAmount: 5,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
    },
    legend: { show: false },
    fill: {
      opacity: 1,
    },
  });
  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="row dashboard-stats">
            <h5 className="mb-3">View from Z Report</h5>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-count w-100">
                <div className="dash-counts">
                  <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <CountUp
                        start={0}
                        end={zReportData.totalTransactions}
                        duration={3}
                        separator=","
                      />
                    )}
                  </h4>
                  <h5 style={{ fontSize: '12px', marginBottom: '0' }}>Total Transactions</h5>
                </div>
                <div className="dash-imgs">
                  <ShoppingBag size={14} />
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-count das1 w-100">
                <div className="dash-counts">
                  <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <CountUp
                        start={0}
                        end={zReportData.fullyTotalSales}
                        duration={3}
                        prefix="$"
                        separator=","
                        decimal="."
                      />
                    )}
                  </h4>
                  <h5 style={{ fontSize: '12px', marginBottom: '0' }}>Total Sales</h5>
                </div>
                <div className="dash-imgs">
                  <TrendingUp size={14} />
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-count das2 w-100">
                <div className="dash-counts">
                  <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>150</h4>
                  <h5 style={{ fontSize: '12px', marginBottom: '0' }}>Banking</h5>
                </div>
                <div className="dash-imgs">
                  <CreditCard size={14} />
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-count das3 w-100">
                <div className="dash-counts">
                  <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>170</h4>
                  <h5 style={{ fontSize: '12px', marginBottom: '0' }}>Payouts</h5>
                </div>
                <div className="dash-imgs">
                  <Send size={14} />
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-count w-100">
                <div className="dash-counts">
                  <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>100</h4>
                  <h5 style={{ fontSize: '12px', marginBottom: '0' }}>Difference</h5>
                </div>
                <div className="dash-imgs">
                  <DollarSign size={14} />
                </div>
              </div>
            </div>
            <h5 className="mb-3">View from X Report</h5>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-widget dash1 w-100">
                <div className="dash-widgetimg" style={{ marginRight: '8px' }}>
                  <span>
                    <ImageWithBasePath
                      src="assets/img/icons/dash1.svg"
                      alt="img"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </span>
                </div>
                <div className="dash-widgetcontent">
                  <h5 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <CountUp
                        start={0}
                        end={xReportData.totalTransactions}
                        duration={3}
                        separator=","
                      />
                    )}
                  </h5>
                  <h6 style={{ fontSize: '12px', marginBottom: '0' }}>Total Transactions</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-widget w-100">
                <div className="dash-widgetimg" style={{ marginRight: '8px' }}>
                  <span>
                    <ImageWithBasePath
                      src="assets/img/icons/dash2.svg"
                      alt="img"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </span>
                </div>
                <div className="dash-widgetcontent">
                  <h5 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <CountUp 
                        start={0} 
                        end={xReportData.totalSales} 
                        duration={3} 
                        prefix="$" 
                        separator=","
                        decimal="."
                      />
                    )}
                  </h5>
                  <h6 style={{ fontSize: '12px', marginBottom: '0' }}>Total Sales</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-widget dash2 w-100">
                <div className="dash-widgetimg" style={{ marginRight: '8px' }}>
                  <span>
                    <ImageWithBasePath
                      src="assets/img/icons/dash3.svg"
                      alt="img"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </span>
                </div>
                <div className="dash-widgetcontent">
                  <h5 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    $
                    <CountUp
                      start={0}
                      end={385656.5}
                      duration={3}
                      decimals={1}
                    />
                  </h5>
                  <h6 style={{ fontSize: '12px', marginBottom: '0' }}>Banking</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-widget dash3 w-100">
                <div className="dash-widgetimg" style={{ marginRight: '8px' }}>
                  <span>
                    <ImageWithBasePath
                      src="assets/img/icons/dash4.svg"
                      alt="img"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </span>
                </div>
                <div className="dash-widgetcontent">
                  <h5 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    $
                    <CountUp
                      start={0}
                      end={40000}
                      duration={3}
                    />
                  </h5>
                  <h6 style={{ fontSize: '12px', marginBottom: '0' }}>Payouts</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-2-4 col-sm-6 col-12 d-flex dashboard-card">
              <div className="dash-widget dash2 w-100">
                <div className="dash-widgetimg" style={{ marginRight: '8px' }}>
                  <span>
                    <ImageWithBasePath
                      src="assets/img/icons/compare.png"
                      alt="img"
                      style={{ width: '24px', height: '24px' }}
                    />
                  </span>
                </div>
                <div className="dash-widgetcontent">
                  <h5 style={{ fontSize: '16px', marginBottom: '2px' }}>
                    $
                    <CountUp
                      start={0}
                      end={385656.5}
                      duration={3}
                      decimals={1}
                    />
                  </h5>
                  <h6 style={{ fontSize: '12px', marginBottom: '0' }}>Difference</h6>
                </div>
              </div>
            </div>
          </div>
          <div className="row dashboard-charts">
            <div className="col-xl-7 col-sm-12 col-12 d-flex chart-card">
              <div className="card flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Purchase &amp; Sales</h5>
                  <div className="graph-sets">
                    <ul className="mb-0">
                      <li>
                        <span>Sales</span>
                      </li>
                      <li>
                        <span>Purchase</span>
                      </li>
                    </ul>
                    <div className="dropdown dropdown-wraper">
                      <button
                        className="btn btn-light btn-sm dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        2023
                      </button>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <li>
                          <Link to="#" className="dropdown-item">
                            2023
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            2022
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            2021
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="sales_charts" />
                  <Chart
                    options={chartOptions}
                    series={chartOptions.series}
                    type="bar"
                    height={320}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-sm-12 col-12 d-flex">
              <div className="card flex-fill default-cover mb-4 alert-card">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#dc3545', padding: '12px 15px' }}>
                  <h4 className="card-title mb-0" style={{ color: '#fff' }}>
                    Alert
                  </h4>
                  <div className="view-all-link">
                    <Link to={route.lowstock} className="view-all d-flex align-items-center" style={{ color: '#fff' }}>
                      View All
                      <span className="ps-2 d-flex align-items-center">
                        <ArrowRight className="feather-16" />
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {stockLoading ? (
                    <div className="text-center py-3">Loading...</div>
                  ) : (
                    <>
                      <div className="table-tab mb-3">
                        <ul className="nav nav-pills" id="stock-tab" role="tablist">
                          <li className="nav-item" role="presentation">
                            <button
                              className={`nav-link ${activeStockTab === "low" ? "active" : ""}`}
                              id="low-stock-tab"
                              data-bs-toggle="pill"
                              data-bs-target="#low-stock-content"
                              type="button"
                              role="tab"
                              aria-controls="low-stock-content"
                              aria-selected={activeStockTab === "low"}
                              onClick={() => handleStockTabChange("low")}
                            >
                              Low Stock
                            </button>
                          </li>
                          <li className="nav-item" role="presentation">
                            <button
                              className={`nav-link ${activeStockTab === "out" ? "active" : ""}`}
                              id="out-stock-tab"
                              data-bs-toggle="pill"
                              data-bs-target="#out-stock-content"
                              type="button"
                              role="tab"
                              aria-controls="out-stock-content"
                              aria-selected={activeStockTab === "out"}
                              onClick={() => handleStockTabChange("out")}
                            >
                              Out of Stock
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="tab-content" id="stock-tabContent">
                        {/* Low Stock Tab */}
                        <div
                          className={`tab-pane fade ${activeStockTab === "low" ? "show active" : ""}`}
                          id="low-stock-content"
                          role="tabpanel"
                          aria-labelledby="low-stock-tab"
                        >
                          <div className="table-responsive dataview">
                            <table className="table" style={{ borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>#</th>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>Product</th>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lowStockProducts.length > 0 ? (
                                  lowStockProducts.slice(0, 5).map((product, index) => (
                                    <tr key={`low-${product.id || index}`}>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <Link to={route.productlist} style={{ textDecoration: 'none', color: '#333' }}>
                                          {product.name}
                                        </Link>
                                      </td>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <span style={{ 
                                          backgroundColor: '#D3B0B0', 
                                          color: '#000', 
                                          padding: '4px 12px',
                                          borderRadius: '4px',
                                          display: 'inline-block',
                                          minWidth: '30px',
                                          textAlign: 'center'
                                        }}>
                                          {product.quantity}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="3" style={{ padding: '8px', textAlign: 'center' }}>
                                      No low stock products found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {/* Out of Stock Tab */}
                        <div
                          className={`tab-pane fade ${activeStockTab === "out" ? "show active" : ""}`}
                          id="out-stock-content"
                          role="tabpanel"
                          aria-labelledby="out-stock-tab"
                        >
                          <div className="table-responsive dataview">
                            <table className="table" style={{ borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>#</th>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>Product</th>
                                  <th style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {outOfStockProducts.length > 0 ? (
                                  outOfStockProducts.slice(0, 5).map((product, index) => (
                                    <tr key={`out-${product.id || index}`}>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <Link to={route.productlist} style={{ textDecoration: 'none', color: '#333' }}>
                                          {product.name}
                                        </Link>
                                      </td>
                                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <span style={{ 
                                          backgroundColor: '#dc3545', 
                                          color: '#fff', 
                                          padding: '4px 12px',
                                          borderRadius: '4px',
                                          display: 'inline-block'
                                        }}>
                                          Out of Stock
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="3" style={{ padding: '8px', textAlign: 'center' }}>
                                      No out of stock products found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
