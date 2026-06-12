import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Header from "../InitialPage/Sidebar/Header";
import Sidebar from "../InitialPage/Sidebar/Sidebar";
import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../feature-module/loader/loader";
import AccessDenied from "../feature-module/pages/AccessDenied";

// Routes USER role can access (only POS + profile)
const USER_ALLOWED_PATHS = ["/pos", "/profile"];

// Blocks USER role from non-POS pages and shows Access Denied.
const RoleRoute = () => {
  const role = (localStorage.getItem("userRole") || "").toUpperCase();
  const location = useLocation();
  const isUser = role === "USER" || role === "ROLE_USER";
  if (isUser) {
    const allowed = USER_ALLOWED_PATHS.some(p => location.pathname.startsWith(p));
    if (!allowed) return <AccessDenied />;
  }
  return <Outlet />;
};

// Redirects to signin if no token is present.
// Uses window.location.replace for a hard redirect that bypasses BFCache.
const PrivateRoute = () => {
  const token = sessionStorage.getItem("accessToken");

  React.useEffect(() => {
    // Empty beforeunload listener opts this page out of BFCache in most browsers.
    const noop = () => {};
    window.addEventListener("beforeunload", noop);

    // Handle browser back/forward buttons — fires before React re-renders.
    const handlePopState = () => {
      if (!sessionStorage.getItem("accessToken")) {
        window.location.replace("/signin");
      }
    };
    window.addEventListener("popstate", handlePopState);

    // Handle BFCache restoration (Safari / older Chrome).
    const handlePageShow = (e) => {
      if (e.persisted && !sessionStorage.getItem("accessToken")) {
        window.location.replace("/signin");
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("beforeunload", noop);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  if (!token) {
    window.location.replace("/signin");
    return null;
  }

  return <Outlet />;
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
          <Route element={<RoleRoute />}>
            <Route path={"/"} element={<HeaderLayout />}>
              {publicRoutes.map((route, id) => (
                <Route path={route.path} element={route.element} key={id} />
              ))}
            </Route>
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
