import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import { getAccessToken, getUserByEmail } from "../../Api/config";

const Signin = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError("Email must contain @ symbol");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = await getAccessToken(email, password);
      if (!token) {
        setError("User not found. Please check your email/username and password.");
        setIsLoading(false);
        return;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        setError("Failed to fetch user details. Please try again.");
        setIsLoading(false);
        return;
      }

      if (user.userRoleDto?.userRole === "ADMIN") {
        navigate(route.dashboard);
      } else if (user.userRoleDto?.userRole === "USER") {
        navigate(route.pos);
      } else if (user.userRoleDto?.userRole === "MANAGER") {
        navigate(route.dashboard);
      } else {
        setError("Unknown role. Please contact support.");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError") ||
        error.message?.includes("Network Error") ||
        error.message?.includes("ERR_CONNECTION_REFUSED") ||
        !navigator.onLine
      ) {
        setError("Database connection error. Please check if the server is running.");
      } else {
        setError("Connection error. Please check your internet connection or try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim()) {
      if (!value.includes('@')) {
        setEmailError("Email must contain @ symbol");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <form onSubmit={handleSignIn}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt />
                </Link>
                <div className="login-userheading">
                  <h3>Sign In</h3>
                  <h4>
                    Access the Codearson POS panel using your email and password.
                  </h4>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Username Or Email</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className={`form-control ${emailError ? "border-danger" : ""}`}
                      value={email}
                      onChange={handleEmailChange}
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/mail.svg"
                      alt="img"
                    />
                  </div>
                  {emailError && <small className="text-danger">{emailError}</small>}
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`pass-input form-control ${passwordError ? "border-danger" : ""}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.trim()) setPasswordError("");
                      }}
                    />
                    <span
                      className={`fas toggle-password ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                  {passwordError && <small className="text-danger">{passwordError}</small>}
                </div>
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      {/* <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input type="checkbox" className="form-control" />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>  */}
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {error && <p className="text-danger text-center mb-3">{error}</p>}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
                {/* <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {" "}
                      Create an account
                    </Link>
                  </h4>
                </div> */}
                {/* <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <Link to="#" className="facebook-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/facebook-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/google.png"
                          alt="Google"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="apple-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </Link>
                    </li>
                  </ul>
                  
                </div> */}
                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2025 Codearson POS. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;