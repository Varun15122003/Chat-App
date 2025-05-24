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
    if (!token && location.pathname !== '/login' && location.pathname !== '/register' && !authUser) {
      navigate('/login', { replace: true });
    }
    
  }, [ location, navigate]);

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