import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Header from "../InitialPage/Sidebar/Header";
import Sidebar from "../InitialPage/Sidebar/Sidebar";
import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../feature-module/loader/loader";

// Redirects to signin if no token is present.
// Also prevents BFCache from restoring authenticated pages after logout.
const PrivateRoute = () => {
  const token = localStorage.getItem("accessToken");

  React.useEffect(() => {
    // An empty beforeunload listener opts this page out of BFCache in most browsers,
    // so the browser can't restore a stale authenticated view after logout.
    const noop = () => {};
    window.addEventListener("beforeunload", noop);

    // If BFCache does restore the page (e.g. Safari), re-check the token.
    const handlePageShow = (e) => {
      if (e.persisted && !localStorage.getItem("accessToken")) {
        window.location.replace("/signin");
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("beforeunload", noop);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return token ? <Outlet /> : <Navigate to="/signin" replace />;
};

const AllRoutes = () => {
  const data = useSelector((state) => state.toggle_header);
  const HeaderLayout = () => (
    <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
      <Header />
      <Sidebar />
      <Outlet />
      <Loader />
    </div>
  );

  const Authpages = () => (
    <div className={data ? "header-collapse" : ""}>
      <Outlet />
      <Loader />
    </div>
  );

  const Pospages = () => (
    <div>
      <Outlet />
      <Loader />
    </div>
  );

  console.log(publicRoutes, "dashboard");

  // return (
  //   <div>
  //     <Routes>
  //       <Route path="/pos" element={<Pospages />}>
  //         {posRoutes.map((route, id) => (
  //           <Route path={route.path} element={route.element} key={id} />
  //         ))}
  //       </Route>
  //       <Route path={"/"} element={<HeaderLayout />}>
  //         {publicRoutes.map((route, id) => (
  //           <Route path={route.path} element={route.element} key={id} />
  //         ))}
  //       </Route>

  //       <Route path={"/"} element={<Authpages />}>
  //         {pagesRoute.map((route, id) => (
  //           <Route path={route.path} element={route.element} key={id} />
  //         ))}
  //       </Route>
  //     </Routes>
  //   </div>
  // );

// Inside the AllRoutes component's return statement
return (
  <div>
    <Routes>
      {/* Redirect root to sign-in */}
      <Route path="/" element={<Navigate to="/signin" replace />} />
      
      {/* POS Routes — protected */}
      <Route element={<PrivateRoute />}>
        <Route path="/pos" element={<Pospages />}>
          {posRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>
      </Route>

      {/* Protected Routes (Dashboard and others) */}
      <Route element={<PrivateRoute />}>
        <Route path={"/"} element={<HeaderLayout />}>
          {publicRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>
      </Route>
      
      {/* Authentication Routes (Sign-in, Register, etc.) */}
      <Route path={"/"} element={<Authpages />}>
        {pagesRoute.map((route, id) => (
          <Route path={route.path} element={route.element} key={id} />
        ))}
      </Route>
    </Routes>
  </div>
);

};
export default AllRoutes;
