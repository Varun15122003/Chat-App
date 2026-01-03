import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import Register from './Register';
import Login from './Login';
import { useEffect } from 'react';
import OtpForm from './otpVerification/OtpForm';


const Routers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const token = localStorage.getItem("token");
  const authUser = localStorage.getItem("authUser");
  const path = location.pathname;

  // 1. No authUser and no token → only allow login & register
  if (!authUser && !token) {
    if (path !== "/login" && path !== "/register") {
      navigate("/login", { replace: true });
    }
    return;
  }

  // 2. authUser exists but token not verified → go to verifyEmailOtp
  if (authUser && !token) {
    if (path !== "/verifyEmailOtp") {
      navigate("/verifyEmailOtp", { replace: true });
    }
    return;
  }

  // 3. token exists → go to home
  if (token) {
    if (path === "/login" || path === "/register" || path === "/verifyEmailOtp") {
      navigate("/", { replace: true });
    }
  }

}, [location.pathname, navigate]);


  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/verifyEmailOtp" element={<OtpForm />} />
      </Routes>
  )
}

export default Routers