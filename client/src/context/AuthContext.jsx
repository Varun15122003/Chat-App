import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRenderContext } from './RenderContext';


const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const { activeTab } = useRenderContext()


    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/getAllUsers`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUsers([...response.data]);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedImage(file);
        const formData = new FormData();
        // console.log("Selected file for profile image:", file)
        formData.append('file', file);

        const fetchUser = async () => {
            try {
                await axios.post(`${API_URL}/api/auth/uploadProfileImg`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
        await fetchUser();
    };


    const fetchUser = async (token) => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/getUserDetails`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log(activeTab)
        if (token) {
            setIsLoggedIn(true);
            fetchUser(token);
        }
    }, [selectedImage, location, activeTab]);


    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoggedIn,
                setIsLoggedIn,
                fetchUser,
                selectedImage,
                setSelectedImage,
                handleFileChange,
                logout,
                showModel,
                setShowModel,
                fetchUsers,
                users,
                setUsers,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};



export default AuthProvider;
