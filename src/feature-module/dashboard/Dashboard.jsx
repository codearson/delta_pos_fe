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
import { fetchTransactionDetails } from "../Api/TransactionDetailListApi";
import PropTypes from 'prop-types';
import './dashboard.css';  // We'll create this CSS file next

// New TopProductsChart component
const TopProductsChart = ({ className }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [dateFilterType, setDateFilterType] = useState('year');

  // Get unique years from transaction data
  const getAvailableYears = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    const years = [...new Set(transactions.map(detail => 
      new Date(detail.transactionDto.dateTime).getFullYear()
    ))];
    return years.sort((a, b) => b - a);
  };

  // Get months for selected year
  const getAvailableMonths = (transactions, year) => {
    if (!transactions || transactions.length === 0) return [];
    const months = [...new Set(transactions
      .filter(detail => new Date(detail.transactionDto.dateTime).getFullYear() === year)
      .map(detail => new Date(detail.transactionDto.dateTime).getMonth() + 1)
    )];
    return months.sort((a, b) => a - b);
  };

  // Get dates for selected year and month
  const getAvailableDates = (transactions, year, month) => {
    if (!transactions || transactions.length === 0) return [];
    const dates = [...new Set(transactions
      .filter(detail => {
        const date = new Date(detail.transactionDto.dateTime);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      })
      .map(detail => new Date(detail.transactionDto.dateTime).getDate())
    )];
    return dates.sort((a, b) => a - b);
  };

  // Function to get month name
  const getMonthName = (month) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  };

  const [chartOptions, setChartOptions] = useState({
    series: [{ name: "Quantity", data: [] }],
    colors: ["#28C76F"],
    chart: {
      type: "bar",
      height: 380,
      stacked: false,
      zoom: { enabled: true },
      toolbar: {
        show: true
      },
      parentHeightOffset: 0
    },
    responsive: [{
      breakpoint: 280,
      options: {
        legend: {
          position: "bottom",
          offsetY: 0,
        },
      },
    }],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
        columnWidth: "20%",
        barHeight: "40%",
        distributed: false,
        rangeBarOverlap: true,
        rangeBarGroupRows: false,
      },
    },
    dataLabels: { 
      enabled: false
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        },
        maxWidth: 200,
        trim: false,
        tooltip: {
          enabled: true
        }
      }
    },
    xaxis: {
      title: {
        text: "Quantity",
        style: {
          fontSize: '14px'
        }
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    legend: { show: false },
    fill: { opacity: 1 },
  });

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartLoading(true);
        const transactionDetails = await fetchTransactionDetails();
        
        if (transactionDetails && transactionDetails.length > 0) {
          const filteredTransactions = transactionDetails.filter(detail => {
            const transactionDate = new Date(detail.transactionDto.dateTime);
            const transactionYear = transactionDate.getFullYear();
            const transactionMonth = transactionDate.getMonth() + 1;
            const transactionDay = transactionDate.getDate();

            switch (dateFilterType) {
              case 'year':
                return transactionYear === selectedYear;
              case 'month':
                return transactionYear === selectedYear && transactionMonth === selectedMonth;
              case 'date':
                return transactionYear === selectedYear && 
                       transactionMonth === selectedMonth && 
                       transactionDay === selectedDate;
              default:
                return true;
            }
          });

          const productQuantityMap = {};
          filteredTransactions.forEach(detail => {
            if (detail.productDto && detail.productDto.name) {
              const productName = detail.productDto.name;
              const quantity = detail.quantity || 0;
              productQuantityMap[productName] = (productQuantityMap[productName] || 0) + quantity;
            }
          });
          
          const sortedProducts = Object.entries(productQuantityMap)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
          
          setTopProducts(sortedProducts);
          
          const years = getAvailableYears(transactionDetails);
          if (years.length > 0 && !years.includes(selectedYear)) {
            setSelectedYear(years[0]);
          }
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setChartLoading(false);
      }
    };
    
    loadChartData();
  }, [selectedYear, selectedMonth, selectedDate, dateFilterType]);

  useEffect(() => {
    if (topProducts.length > 0) {
      setChartOptions(prevOptions => ({
        ...prevOptions,
        series: [{
          name: "Quantity",
          data: topProducts.map(product => product.quantity),
        }],
        xaxis: {
          ...prevOptions.xaxis,
          categories: topProducts.map(product => product.name),
        }
      }));
    }
  }, [topProducts]);

  return (
    <div className={className}>
      <div className="card flex-fill">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Top 10 Products</h5>
          <div className="graph-sets">
            <ul className="mb-0">
              <li>
                <span>Quantity</span>
              </li>
            </ul>
            <div className="d-flex align-items-center gap-2">
              <select 
                className="form-select form-select-sm"
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
              >
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
                <option value="date">Daily</option>
              </select>

              <select
                className="form-select form-select-sm"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setSelectedMonth(1);
                  setSelectedDate(1);
                }}
              >
                {getAvailableYears(JSON.parse(localStorage.getItem('transactionDetails') || '[]')).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {(dateFilterType === 'month' || dateFilterType === 'date') && (
                <select
                  className="form-select form-select-sm"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(parseInt(e.target.value));
                    setSelectedDate(1);
                  }}
                >
                  {getAvailableMonths(
                    JSON.parse(localStorage.getItem('transactionDetails') || '[]'),
                    selectedYear
                  ).map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              )}

              {dateFilterType === 'date' && (
                <select
                  className="form-select form-select-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(parseInt(e.target.value))}
                >
                  {getAvailableDates(
                    JSON.parse(localStorage.getItem('transactionDetails') || '[]'),
                    selectedYear,
                    selectedMonth
                  ).map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          {chartLoading ? (
            <div className="text-center py-5">Loading chart data...</div>
          ) : (
            <>
              <div id="sales_charts" />
              <Chart
                options={chartOptions}
                series={chartOptions.series}
                type="bar"
                height={380}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

TopProductsChart.propTypes = {
  className: PropTypes.string.isRequired
};

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
            <TopProductsChart className="col-xl-7 col-sm-12 col-12 d-flex chart-card" />
            <div className="col-xl-5 col-sm-12 col-12 d-flex">
              <div className="card flex-fill default-cover mb-4 alert-card">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#dc3545', padding: '12px 15px' }}>
                  <div className="d-flex align-items-center">
                    <div className="notification-bell me-2">
                      <i className="fas fa-bell"></i>
                      <span className="notification-badge">
                        {lowStockProducts.length + outOfStockProducts.length}
                      </span>
                    </div>
                    <h4 className="card-title mb-0" style={{ color: '#fff' }}>
                      Stock Alerts
                    </h4>
                  </div>
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
                    <div className="stock-alerts-container">
                      {/* Low Stock Alerts */}
                      {lowStockProducts.length > 0 && (
                        <div className="alert-section mb-4">
                          <h5 className="alert-section-title">
                            <span className="alert-icon low-stock-icon">
                              <i className="fas fa-exclamation-triangle"></i>
                            </span>
                            Low Stock Products
                            <span className="alert-count">{lowStockProducts.length}</span>
                          </h5>
                          <div className="alert-items">
                            {lowStockProducts.slice(0, 5).map((product, index) => (
                              <div key={`low-${product.id || index}`} className="alert-item">
                                <div className="alert-item-content">
                                  <div className="alert-item-title">
                                    <Link to={route.productlist} style={{ textDecoration: 'none', color: '#333' }}>
                                      {product.name}
                                    </Link>
                                  </div>
                                  <div className="alert-item-badge">
                                    <span className="badge low-stock-badge">
                                      {product.quantity} units
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {lowStockProducts.length > 5 && (
                              <div className="alert-more">
                                <Link to={route.lowstock} className="alert-more-link">
                                  +{lowStockProducts.length - 5} more items
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Out of Stock Alerts */}
                      {outOfStockProducts.length > 0 && (
                        <div className="alert-section">
                          <h5 className="alert-section-title">
                            <span className="alert-icon out-of-stock-icon">
                              <i className="fas fa-times-circle"></i>
                            </span>
                            Out of Stock Products
                            <span className="alert-count">{outOfStockProducts.length}</span>
                          </h5>
                          <div className="alert-items">
                            {outOfStockProducts.slice(0, 5).map((product, index) => (
                              <div key={`out-${product.id || index}`} className="alert-item">
                                <div className="alert-item-content">
                                  <div className="alert-item-title">
                                    <Link to={route.productlist} style={{ textDecoration: 'none', color: '#333' }}>
                                      {product.name}
                                    </Link>
                                  </div>
                                  <div className="alert-item-badge">
                                    <span className="badge out-of-stock-badge">
                                      Out of Stock
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {outOfStockProducts.length > 5 && (
                              <div className="alert-more">
                                <Link to={route.lowstock} className="alert-more-link">
                                  +{outOfStockProducts.length - 5} more items
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* No Alerts Message */}
                      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                        <div className="no-alerts-message">
                          <i className="fas fa-check-circle mb-3" style={{ fontSize: '2rem', color: '#28a745' }}></i>
                          <p>No stock alerts at this time.</p>
                        </div>
                      )}
                    </div>
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
