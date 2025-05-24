import styles from './NewChat.module.css'
import { useAuthContext } from '../../context/AuthContext'
import { useRenderContext } from '../../context/RenderContext'
import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useChatContext } from '../../context/ChatContext'

const NewChat = () => {
    const { users, fetchUsers } = useAuthContext()
    const { setChatPerson} = useChatContext()
    const { setActiveTab } = useRenderContext()

    const handleDetails = (user) => {
        if (user.isVerifiedAccount === true) {
            setChatPerson(user);
            setActiveTab('chat');

        }
        else {
            toast.error("this user account is not verified yet")
        }
    }

    let token;

    useEffect(() => {
        token = localStorage.getItem("token");
        if (token) {
            fetchUsers(token);
        }
    }, [location, token]);
    // if (!user) return <div>Loading...</div>; 
    return (
        <>
            <ToastContainer />
            <div className={`${styles.chatContainer}`}>
                <div className={`${styles.chatHeaderContainer}`}>
                    <div className={`${styles.chatHeader}`}>
                        <div className={`${styles.name}`}>
                            <h2>Add your freind list</h2>
                        </div>
                        <div className={`${styles.chatIcons}`}>
                            <div className={`${styles.icon}`}>
                                <div className={`${styles.navigate}`}></div>
                                <div className={`${styles.navigate}`}></div>
                                <div className={`${styles.navigate}`}></div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.searchbar}`}>
                        <div className={`${styles.chatSearchbar}`}>
                            <div className={`${styles.searchIcon}`}><i className="fa-solid fa-magnifying-glass"></i></div>
                            <input type="text" placeholder="Search" />
                        </div>
                    </div>
                </div>
                <div className={`${styles.allPerson}`}>
                    {users?.map((user) => (
                        <div className={`${styles.chatPerson}`} key={user?._id} onClick={() => {
                                        handleDetails(user)
                                    }}>
                            <div className={`${styles.person}`}>
                                <div className={`${styles.personImage}`}>
                                    <img src={user?.profileImage} alt="/" />
                                </div>
                            </div>
                            <div className={`${styles.personName}`}>
                                <div className={`${styles.personDetails}`}>
                                    <h3>{user?.name}</h3>
                                    <div><i className="fa-solid fa-handshake"></i></div>
                                </div>
                                <div className={`${styles.personMessage}`}>
                                    <p>{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )
                    )}
                </div>
            </div>
        </>
    )
}

export default NewChat