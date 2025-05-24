import { useAuthContext } from '../context/AuthContext';
import styles from './LogOutModel.module.css'
const LogOutModel = () => {

    const { logout, showModel, setShowModel } = useAuthContext();

    const handleYes = () => {
        logout();
        setShowModel(false);
    }

    const handleNo = () => {
        setShowModel(false);
    }

    return (
        <div className={`${styles.logOutModel} ${showModel ? styles.showModel : styles.hideModel}`}>
            <div className={`${styles.logoutModel_content}`}>
                <h2>Are you sure you want to logout?</h2>
                <div className={`${styles.logoutModel_btn}`}>
                    <button onClick={handleYes}>Yes</button>
                    <button onClick={handleNo}>No</button>
                </div>
            </div>
        </div>
    )
}

export default LogOutModel