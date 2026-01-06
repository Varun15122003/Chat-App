import styles from './RegisterForm.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_AUTH_API_URL;


const RegisterForm = () => {
    const navigate = useNavigate()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = {
            name: `${firstName} ${lastName}`,
            email: email,
            password: password
        }
        try {
            const response = await axios.post(`${API_URL}/register`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }

            })

            if (response.status === 201) {
                const authUser = response.data.authUser
                localStorage.setItem('authUser', authUser)
                toast.success(response.data.msg)
                setTimeout(() => {
                    navigate('/verifyEmailOtp', { replace: true })
                }, 2000)
            } else if (response.status === 200) {
                toast.error(response.data.msg)
            } else {
                toast.error("Something went wrong")
            }

        } catch (error) {
            console.error('Error registering user:', error)
        }
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'firstName':
                setFirstName(value)
                break;
            case 'lastName':
                setLastName(value)
                break;
            case 'email':
                setEmail(value)
                break;
            case 'password':
                setPassword(value)
                break;
            default:
                break;
        }

    }

    return (
        <>
            <ToastContainer />
            <form className={`${styles.container}`} onSubmit={handleSubmit}>
                <div className={`${styles.img}`}>
                    <img src="img.jpg" alt="" />
                </div>
                <div className={`${styles.form}`}>
                    <h1>Create an account</h1>
                    <p>Already have an account ? <Link to="/login">Log in</Link></p>
                    <div className={`${styles.name}`}>
                        <input type="text" name='firstName' placeholder="First Name" value={firstName} onChange={handleChange} required />
                        <input type="text" name='lastName' placeholder="Last Name" value={lastName} onChange={handleChange} required />
                    </div>
                    <div className={`${styles.name}`}>
                        <input type="email" name='email' placeholder="Email" value={email} onChange={handleChange} required />
                    </div>
                    <div className={`${styles.name}`}>
                        <input type="password" name='password' placeholder="Password" value={password} onChange={handleChange} required />
                    </div>
                    <div className={`${styles.check_name}`}>
                        <input type="checkbox" required />
                        <p>I agree to the <Link to="">terms and conditions</Link></p>
                    </div>
                    <div className={`${styles.name}`}>
                        <button>Create account </button>
                    </div>
                    <div className={`${styles.option}`}>
                        <div></div>
                        <p>or register with</p>
                        <div></div>
                    </div>
                    <div className={`${styles.icon}`}>
                        <div className={`${styles.google}`}>
                            <Link href=""><img src="/google.png" alt="none" style={{ width: '20px', height: '20px' }} />Google</Link>
                        </div>
                        <div className={`${styles.apple}`}>
                            <Link to=""><i className="fa-brands fa-apple"></i>Apple</Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default RegisterForm