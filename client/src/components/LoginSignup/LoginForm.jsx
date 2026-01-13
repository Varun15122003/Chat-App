import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginForm.module.css'
import { useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthContext } from '../../context/AuthContext'
const API_URL = import.meta.env.VITE_API_URL || "https://webchatapp-gee4a3a7d3g7aqbe.centralindia-01.azurewebsites.net";

const LoginForm = () => {
    const { setUser, setIsLoggedIn } = useAuthContext()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = {
            email: email,
            password: password
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
           
            if (response.status === 200) {
                const token = response.data.token
                console.log("Token:", token);
                localStorage.setItem('token', token)

                const userResponse = await axios.get(`${API_URL}/api/auth/getUserDetails`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIsLoggedIn(true)
                setUser(userResponse.data)
                toast.success(response.data.msg)
                setTimeout(() => {
                    navigate('/', { replace: true })
                }, 2000)
            } else if(response.status === 201) {
                const authUser = response.data.authUser
                localStorage.setItem('authUser', authUser)
                toast.success(response.data.msg)
                setTimeout(() => {
                    navigate('/verifyEmailOtp', { replace: true })
                }, 2000)
            } else {
                toast.error("Invalid credentials")
            }
           
        } catch (error) {
            console.error('Error logging in user:', error)
            toast.error("Something went wrong. Please try again.")
        }
    }


    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'email') setEmail(value)
        if (name === 'password') setPassword(value)
    }

    return (
        <>
            <ToastContainer />
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.img}>
                    <img src="img.jpg" alt="" />
                </div>
                <div className={styles.form}>
                    <h1>Create an account</h1>
                    <p>Don’t have an account? <Link to="/register">Register</Link></p>
                    <div className={styles.name}>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.name}>
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.check_name}>
                        <input type="checkbox" />
                        <p>I agree to the <Link to="">terms and conditions</Link></p>
                    </div>
                    <div className={styles.name}>
                        <button type="submit">Login</button>
                    </div>
                    <div className={styles.option}>
                        <div></div>
                        <p>or register with</p>
                        <div></div>
                    </div>
                    <div className={styles.icon}>
                        <div className={styles.google}>
                            <Link to="/">
                                <img src="/google.png" alt="google" style={{ width: '20px', height: '20px' }} />
                                Google
                            </Link>
                        </div>
                        <div className={styles.apple}>
                            <Link to="/">
                                <i className="fa-brands fa-apple"></i>
                                Apple
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default LoginForm
