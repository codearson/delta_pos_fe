// Signin.js
import React, { useState, useEffect } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import { getAccessToken, getUserByEmail } from "../../Api/config";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

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
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    // Get device fingerprint and additional device info
    const getDeviceInfo = async () => {
      try {
        console.log('%c 🔍 Collecting device information...', 'color: #4CAF50; font-weight: bold;');
        
        // Get basic device info that's consistent across domains
        const basicDeviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          colorDepth: window.screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceMemory: navigator.deviceMemory || 'unknown',
          hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
          touchSupport: 'ontouchstart' in window,
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack || 'unknown',
          timestamp: new Date().toISOString()
        };
        
        console.log('%c 📱 Basic device info:', 'color: #2196F3; font-weight: bold;', basicDeviceInfo);
        
        // Generate a hash from the basic device info
        const deviceInfoString = JSON.stringify(basicDeviceInfo);
        const basicDeviceHash = await hashString(deviceInfoString);
        console.log('%c 🔑 Basic device hash:', 'color: #2196F3; font-weight: bold;', basicDeviceHash);
        
        // Initialize FingerprintJS
        console.log('%c 🔍 FingerprintJS: Initializing...', 'color: #4CAF50; font-weight: bold;');
        const fp = await FingerprintJS.load();
        console.log('%c ✅ FingerprintJS: Successfully loaded', 'color: #4CAF50; font-weight: bold;');
        
        // Get the visitor identifier
        console.log('%c 🔍 FingerprintJS: Getting visitor ID...', 'color: #4CAF50; font-weight: bold;');
        const result = await fp.get();
        const visitorId = result.visitorId;
        
        // Combine both identifiers for a more reliable device ID
        const combinedDeviceId = `${basicDeviceHash}_${visitorId}`;
        
        // Store the device IDs in state
        setDeviceId(combinedDeviceId);
        
        // Store in localStorage for future use
        localStorage.setItem('deviceId', combinedDeviceId);
        localStorage.setItem('basicDeviceHash', basicDeviceHash);
        localStorage.setItem('fingerprintId', visitorId);
        localStorage.setItem('deviceInfo', JSON.stringify(basicDeviceInfo));
        
        // Enhanced console logging
        console.log('%c 🔑 DEVICE ID DETECTED', 'color: #2196F3; font-size: 16px; font-weight: bold; background: #E3F2FD; padding: 5px; border-radius: 5px;');
        console.log('%c Combined Device ID:', 'color: #2196F3; font-weight: bold;', combinedDeviceId);
        console.log('%c Basic Device Hash:', 'color: #2196F3; font-weight: bold;', basicDeviceHash);
        console.log('%c FingerprintJS ID:', 'color: #2196F3; font-weight: bold;', visitorId);
        console.log('%c Components used for fingerprint:', 'color: #2196F3; font-weight: bold;', result.components);
        
        // Log to localStorage
        console.log('%c Device ID stored in localStorage:', 'color: #2196F3; font-weight: bold;', localStorage.getItem('deviceId'));
      } catch (error) {
        console.error('%c ❌ Error getting device information:', 'color: #F44336; font-weight: bold;', error);
      }
    };
    
    getDeviceInfo();
  }, []);

  // Simple hash function for device info
  const hashString = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

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
    setEmailError("");
    setPasswordError("");

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // Make sure we have a device ID before proceeding
      if (!deviceId) {
        console.log('%c ⚠️ No device ID in state, checking localStorage...', 'color: #FF9800; font-weight: bold;');
        
        // Try to get it from localStorage if not in state
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          console.log('%c ✅ Found device ID in localStorage:', 'color: #4CAF50; font-weight: bold;', storedDeviceId);
          setDeviceId(storedDeviceId);
        } else {
          // If still no device ID, generate a temporary one
          const tempDeviceId = 'temp_' + Date.now();
          console.log('%c ⚠️ No device ID found, generating temporary ID:', 'color: #FF9800; font-weight: bold;', tempDeviceId);
          setDeviceId(tempDeviceId);
          localStorage.setItem('deviceId', tempDeviceId);
        }
      }

      console.log('%c 🔐 Attempting login with device ID:', 'color: #2196F3; font-weight: bold;', deviceId);
      
      const loginResult = await getAccessToken(email, password);
      if (!loginResult.success) {
        if (loginResult.error === "email_not_found") {
          setEmailError("Email not found");
        } else if (loginResult.error === "incorrect_password") {
          setPasswordError("Please enter valid password");
        } else if (loginResult.error === "network_error") {
          setError("Connection error. Please check your internet connection or try again later.");
        } else {
          setError("An error occurred. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        setError("Failed to fetch user details. Please try again.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("firstName", user.firstName || "");
      localStorage.setItem("lastName", user.lastName || "");
      localStorage.setItem("email", user.emailAddress || "");
      localStorage.setItem("userRole", user.userRoleDto?.userRole || "");
      localStorage.setItem("userId", user.id ? String(user.id) : "1");
      localStorage.setItem("branchId", user.branchDto?.id ? String(user.branchDto.id) : "3");
      localStorage.setItem("branchName", user.branchDto.branchName);
      localStorage.setItem("branchCode", user.branchDto.branchCode);
      localStorage.setItem("branchAddress", user.branchDto.address);
      localStorage.setItem("branchContact", user.branchDto.contactNumber);
      localStorage.setItem("shopName", user.branchDto.shopDetailsDto.name);
      
      // Store device ID with user session
      localStorage.setItem("userDeviceId", deviceId);
      
      // Store additional device info for authentication
      const loginDeviceInfo = {
        deviceId: deviceId,
        basicDeviceHash: localStorage.getItem('basicDeviceHash'),
        fingerprintId: localStorage.getItem('fingerprintId'),
        deviceInfo: JSON.parse(localStorage.getItem('deviceInfo') || '{}'),
        loginTime: new Date().toISOString(),
        domain: window.location.hostname
      };
      
      localStorage.setItem("loginDeviceInfo", JSON.stringify(loginDeviceInfo));
      
      console.log('%c ✅ Login successful! Device ID associated with user session:', 'color: #4CAF50; font-weight: bold;', deviceId);
      console.log('%c 🔍 User details:', 'color: #2196F3; font-weight: bold;', {
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddress,
        role: user.userRoleDto?.userRole,
        deviceId: deviceId,
        domain: window.location.hostname
      });
      console.log('%c 📱 Login device info:', 'color: #2196F3; font-weight: bold;', loginDeviceInfo);

      if (user.userRoleDto?.userRole === "ADMIN") {
        navigate(route.dashboard);
      } else if (user.userRoleDto?.userRole === "USER") {
        localStorage.setItem("shouldCheckBanking", "true");
        navigate(route.pos);
      } else if (user.userRoleDto?.userRole === "MANAGER") {
        navigate(route.dashboard);
      } else {
        setError("Unknown role. Please contact support.");
      }
    } catch (error) {
      console.error('%c ❌ Login error:', 'color: #F44336; font-weight: bold;', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim()) {
      if (!value.includes('@')) {
        setEmailError("Please enter valid email address");
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
                    Access the Codearson Delta_POS panel using your email and password.
                  </h4>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Email</label>
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
                  {error && <p className="text-danger text-center mb-3">{error}</p>}
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © {new Date().getFullYear()} Codearson Delta_POS. All rights reserved</p>
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