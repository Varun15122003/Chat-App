import styles from './ProfileCard.module.css';
import { useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ProfileCard = () => {
    const { user, selectedImage, isLoggedIn, handleFileChange, setSelectedImage, setUser } = useAuthContext();

    const handleFileClick = () => {
        const fileInput = document.querySelector('input[type="file"]');
        fileInput.click();
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getItem();
        } else {
            console.warn('No token found in localStorage');
        }
    }, []);

    const getItem = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/auth/getUserDetails', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUser(response.data);
            setSelectedImage(response.data.profileImage);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileImage}>
                <div className={styles.profileName}>
                    <h2>Profile</h2>
                </div>
                {isLoggedIn && (
                    <div className={styles.profileImg} onClick={handleFileClick}>
                        <input
                            type="file"
                            accept=".jpg, .jpeg"
                            onChange={handleFileChange}
                            name="profileImg"
                            style={{ display: 'none' }}
                        />
                        <img src={selectedImage} alt="profile" />
                        <div className={styles.profileImgIcon}>
                            <i className="fa fa-camera"></i>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.profileDetail}>
                <div className={styles.profileUserName}>
                    <h5>Your Name</h5>
                    <h4>{user?.name}</h4>
                    <p>This is not your username or PIN. This name will be visible to your WhatsApp contacts.</p>
                </div>
                <div className={styles.profileAbout}>
                    <h5>About</h5>
                    <p>Hey there! I am using WhatsApp.</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
