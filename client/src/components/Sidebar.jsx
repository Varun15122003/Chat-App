import styles from './Sidebar.module.css'
import { useRenderContext } from '../context/RenderContext'
import { useAuthContext } from '../context/AuthContext'


const Sidebar = () => {
  const { setActiveTab } = useRenderContext()
  const { selectedImage, user, isLoggedIn} = useAuthContext()

  const handleActive = (tabName) => {
    setActiveTab(tabName)
  }

  return (
    <div className={`${styles.sidebarContainer}`}>
      <div className={`${styles.sidebar}`}>
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('chat')}>
          <div className={`${styles.sidebarItemName}`}>Chats</div>
          <i className="fa-duotone fa-solid fa-message"></i>
        </div>
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('status')}>
          <div className={`${styles.sidebarItemName}`}>Status</div>
          <i className="fa-duotone fa-solid fa-group-arrows-rotate"></i>
        </div>
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('channels')}>
          <div className={`${styles.sidebarItemName}`}>Channels</div>
          <i className="fa-brands fa-signal-messenger"></i>
        </div>
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('communitie')}>
          <div className={`${styles.sidebarItemName}`}>Communitie</div>
          <i className="fa-duotone fa-solid fa-users"></i>
        </div>
        <div className={`${styles.sidebarItem}`}>
          <div className={`${styles.sidebarItemName}`}>Meta AI</div>
          <i className="fa-regular fa-circle"></i>
        </div>
      </div>
      <div className={`${styles.sidebar}`}>
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('setting')}>
          <div className={`${styles.sidebarItemName}`}>Setting</div>
          <i className="fa-solid fa-gear"></i>
        </div>
        {isLoggedIn && (
        <div className={`${styles.sidebarItem}`} onClick={() => handleActive('profile')}>
          <div className={`${styles.sidebarItemName}`}>Profile</div>
          <img src={selectedImage === '' ? user?.profileImage : selectedImage} alt="selectImg" />
        </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar