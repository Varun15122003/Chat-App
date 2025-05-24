import { useAuthContext } from '../context/AuthContext'
import { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext'
import styles from './PersonChat.module.css'

const PersonChat = () => {
    const { user } = useAuthContext();
    const { handleSubmit, setText, text, chatPerson, messages,activeUsers, fetchMessages,} = useChatContext();
    const messageRef = useRef(null);
    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === "message") setText(value)
    }
    const scrollToEnd = () => {
        messageRef?.current?.scrollIntoView({ behavior: "auto" });
    }
    useEffect(() => {
        if (chatPerson?._id && user?._id) {
            fetchMessages();
        }
    }, [chatPerson, user]);

    useEffect(() => {
        scrollToEnd();
    }, [messages]);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };
      


    return (
        <>
            {chatPerson ? (
                <div className={`${styles.personContainer}`} >
                    <div className={`${styles.personNavbar}`}>
                        <div className={`${styles.personDetails}`}>
                            <div className={`${styles.person}`}>
                                <div className={`${styles.personImage}`}>
                                    <img src={chatPerson?.profileImage} alt="/" />
                                </div>
                                <div className={`${styles.personName}`}>
                                    <h2>{chatPerson?.name}</h2>
                                    <status className={`${styles.status}`}>{activeUsers?.find(user => user?._id === chatPerson?._id) ? 'online' : 'offline'}</status>
                                </div>
                            </div>
                            <div className={`${styles.multiIcon}`}>
                                <div className={`${styles.video}`}>
                                    <i className="fa-solid fa-video"></i>
                                </div>
                                <div className={`${styles.phone}`}>
                                    <i className="fa-solid fa-phone"></i>
                                </div>
                                <div className={`${styles.more}`}>
                                    <i className="fa-solid fa-ellipsis-h"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.showMessage}`}>
                        {messages?.length > 0 && messages?.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${msg.sender === user._id ? styles.right : styles.left}`}
                                ref={messageRef}
                            >
                               <div className={`${styles.text}`}><p className={`${styles.messageText}`}>{msg.text}</p></div>
                                <div className={`${styles.time}`}><p className={`${styles.messageTime}`}>{formatTime(msg?.time)}</p></div>
                            </div>
                        ))}
                    </div>
                    <form className={`${styles.personSearch}`}>
                        <div className={`${styles.personSearchDetails}`}>
                            <div className={`${styles.personIcon}`}>
                                <div className={`${styles.personIconP}`}>
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <div className={`${styles.personInputSearch}`}>
                                <div className={`${styles.personInput}`}>
                                    <input type="text" placeholder="Type a message" name="message" value={text} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className={`${styles.personIcon}`}>
                                <div className={`${styles.personIconShare}`} onClick={handleSubmit}>
                                    <button type='submit'><i className="fa-solid fa-share"></i></button>
                                </div>
                                <div className={`${styles.personIconM}`}>
                                    <i className="fa-solid fa-microphone"></i>
                                </div>
                            </div>
                        </div>
                    </form>
                </div >) : (<div className={`${styles.container}`}> <img src="chatapp.webp" alt="/" /></div>)}
        </>
    )
}

export default PersonChat