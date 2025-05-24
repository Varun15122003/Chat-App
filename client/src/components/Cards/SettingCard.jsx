import styles from './SettingCard.module.css'
import { useAuthContext } from '../../context/AuthContext'
import LogOutModel from '../LogoutModel'
import { useRenderContext } from '../../context/RenderContext'
const SettingCard = () => {
    const { user, setShowModel } = useAuthContext()
    const {setActiveTab } = useRenderContext()

    const handleLogOut = () => {
        setShowModel(true);
    }
    return (
        <>
            <LogOutModel />
            <div className={`${styles.settingContainer}`}>
                <div className={styles.settingName}>
                    <h2> Setting </h2>
                </div>
                <div className={`${styles.settingSearchBar}`}>
                    <input type="text" placeholder="Search Settings" />
                </div>
                <div className={`${styles.profile}`} onClick={()=> setActiveTab('profile')}>
                    <div className={`${styles.userImage}`}>
                        <img src={user.profileImage} alt="/" />
                    </div>
                    <div className={`${styles.userName}`}>
                        <div className={`${styles.userDetails}`}>
                            <h3> {user?.name} </h3>
                            <p> Hey there! I am using WhatsApp. </p>
                        </div>
                    </div>
                </div>
                <div className={`${styles.acountSetting}`}>
                    <div className={`${styles.acountIcon}`}>
                        <i className="fa-solid fa-circle-user"></i>
                    </div>
                    <div className={`${styles.acountName}`}>
                        <h4> Acount </h4>
                    </div>
                </div>
                <div className={`${styles.privacySeting}`}>
                    <div className={`${styles.privacyIcon}`}>
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <div className={`${styles.privacyName}`}>
                        <h4> Privacy </h4>
                    </div>
                </div>
                <div className={`${styles.chatSetting}`}>
                    <div className={`${styles.chatIcon}`}>
                        <i className="fa-solid fa-message"></i>
                    </div>
                    <div className={`${styles.chatName}`}>
                        <h4> Chat </h4>
                    </div>
                </div>
                <div className={`${styles.notificationSetting}`}>
                    <div className={`${styles.notificationIcon}`}>
                        <i className="fa-solid fa-bell"></i>
                    </div>
                    <div className={`${styles.notificationName}`}>
                        <h4> Notifications </h4>
                    </div>
                </div>
                <div className={`${styles.keyboardSetting}`}>
                    <div className={`${styles.keyboardIcon}`}>
                        <i className="fa-solid fa-keyboard"></i>
                    </div>
                    <div className={`${styles.keyboardName}`}>
                        <h4> Keyboard Sortcut </h4>
                    </div>
                </div>
                <div className={`${styles.helpSetting}`}>
                    <div className={`${styles.helpIcon}`}>
                        <i className="fa-solid fa-question"></i>
                    </div>
                    <div className={`${styles.helpName}`}>
                        <h4> Help </h4>
                    </div>
                </div>
                <div className={`${styles.logoutSetting}`} onClick={handleLogOut}>
                    <div className={`${styles.logoutIcon}`}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </div>
                    <div className={`${styles.logoutName}`} >
                        <h4> Log out </h4>
                    </div>
                </div>

            </div>
        </>
    )
}

export default SettingCard