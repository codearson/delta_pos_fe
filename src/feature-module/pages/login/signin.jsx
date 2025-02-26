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
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle login and fetch user details
  const handleSignIn = async (e) => {
    e.preventDefault(); 

    setError("");

    console.log("Fetching access token...");

    const token = await getAccessToken(email, password);

    if (!token) {
      setError("Invalid username or password!");
      return;
    }

    console.log("Access Token Retrieved:", token);

    // Fetch user details after getting token
    const user = await getUserByEmail(email);

    if (!user) {
      setError("Failed to fetch user details. Please try again.");
      return;
    }

    console.log("User Details:", user);

    // Redirect based on role
    if (user.userRoleDto?.userRole === "ADMIN") {
      navigate(route.dashboard);
    } else if (user.userRoleDto?.userRole === "USER") {
      navigate(route.pos);
    } else if (user.userRoleDto?.userRole === "MANAGER") {
      navigate(route.dashboard);
    } else {
      setError("Unknown role. Please contact support.");
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
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/mail.svg"
                      alt="img"
                    />
                  </div>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                  <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className={`fas toggle-password ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
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
                      </div> 
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div> */}
                    </div>
                  </div>
                </div>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <div className="form-login">
                <button type="submit" className="btn btn-login">
                    Sign In
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