/* eslint-disable */
import styles from './OtpForm.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useAuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const OtpForm = () => {
    const { setUser, setIsLoggedIn } = useAuthContext();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Assuming you stored the token after register step
        const authUser = localStorage.getItem('authUser');

        if (!authUser) {
            toast.error('Verification token not found');
            return;
        }

        try {
            const decoded = jwtDecode(authUser);
            setEmail(decoded.email);
        } catch (error) {
            console.error('Error decoding token:', error);
            toast.error('Invalid token');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/verifyEmailOtp`,
                { otp },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authUser')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.status === 401) {
                toast.error('Token expired. Please register again.');
                localStorage.removeItem('authUser');
                setTimeout(() => {
                    navigate('/register', { replace: true });
                }, 2000);
                return;
            }

            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                localStorage.removeItem('authUser');
                const userResponse = await axios.get(`${API_URL}/api/auth/getUserDetails`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success(response.data.msg);
                setIsLoggedIn(true);
                setUser(userResponse.data);
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'OTP verification failed');
        }
    };

    return (
        <div>
            <ToastContainer />
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.form}>
                    <h1>Enter OTP</h1>
                    <p>We sent a verification code to your email</p>
                    
                    {/* Changed styles.name to styles.formName to match CSS */}
                    <div className={styles.formName}>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Changed styles.name to styles.formName to match CSS */}
                    <div className={styles.formName}>
                        <button type="submit">Verify OTP</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OtpForm;