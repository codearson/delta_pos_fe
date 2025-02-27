import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import { forgotPassword } from "../../Api/config"; 

const Forgotpassword = () => {
  const route = all_routes;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setLoading(true); 

    try {
      await forgotPassword(email);
      setMessage("Reset code sent successfully to your email!");
      setLoading(false); 
      setTimeout(() => navigate(route.resetpassword), 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to connect to the server";
      setMessage(errorMessage);
      setLoading(false); 
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper forgot-pass-wrap bg-img">
          <div className="login-content">
            <form onSubmit={handleForgotPassword}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt />
                </Link>
                <div className="login-userheading">
                  <h3>Forgot password?</h3>
                  <h4>
                    If you forgot your password, we will email you the code to
                    reset your password.
                  </h4>
                </div>
                <div className="form-login">
                  <label>Email</label>
                  <div className="form-addons">
                    <input
                      type="email"
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
                {message && (
                  <div
                    className={`text-center ${
                      message.includes("success") ? "text-success" : "text-danger"
                    }`}
                  >
                    {message}
                  </div>
                )}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Continue"}
                  </button>
                </div>
                <div className="signinform text-center">
                  <h4>
                    Return to
                    <Link to={route.signin} className="hover-a">
                      {" "}
                      login{" "}
                    </Link>
                  </h4>
                </div>
                {/* <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex justify-content-center">
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
                  <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;