import styles from './Chatcard.module.css'
import { useRenderContext } from '../../context/RenderContext'
import { useAuthContext } from '../../context/AuthContext'
import { useEffect } from 'react'
import { useChatContext } from '../../context/ChatContext'
const Chatcard = () => {
    const { user, users, fetchUser, fetchUsers } = useAuthContext()
    const {setChatPerson, chatPerson} = useChatContext()
    const handleDetailes = (friend)=>{
        setChatPerson(friend);
    }

    const token = localStorage.getItem("token");
    useEffect(() => {
        fetchUser(token);
        fetchUsers()
    }, []);

    const { setActiveTab } = useRenderContext()
    return (
        <div className={`${styles.chatContainer}`}>
            <div className={`${styles.chatHeaderContainer}`}>
                <div className={`${styles.chatHeader}`}>
                    <div className={`${styles.name}`}>
                        <h2>Chats</h2>
                    </div>
                    <div className={`${styles.chatIcons}`}>
                        <div className={`${styles.icon}`}>
                            <i className="fa-solid fa-link" onClick={() => setActiveTab('newChat')}></i>
                        </div>
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
                <div className={`${styles.chatCondition}`}>
                    <div className={`${styles.condition}`}> All </div>
                    <div className={`${styles.condition}`}> Unread </div>
                    <div className={`${styles.condition}`}> Favourties </div>
                    <div className={`${styles.condition}`}> Groups </div>
                </div>
            </div>
            <div className={`${styles.allPerson}`}>
                {user?.friendLists.length > 0 && user?.friendLists?.map((friendId, index) => {
                    const friend = users.find((userObj) => userObj._id === friendId);
                    if (!friend)
                        return null;
                    return (
                        <div key={index} className={`${styles.chatPerson} ${friendId === chatPerson?._id ? styles.activeFriend : ''}`} onClick={()=>{handleDetailes(friend)}}>
                            <div className={`${styles.person}`}>
                                <div className={`${styles.personImage}`}>
                                    <img src={friend.profileImage} alt="/" />
                                </div>
                            </div>
                            <div className={`${styles.personName}`}>
                                <div className={`${styles.personDetails}`}>
                                    <h3> {friend.name}</h3>
                                    <p> 10:00 AM </p>
                                </div>
                                <div className={`${styles.personMessage}`}>
                                    <p> Hey, how are you? </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Chatcard