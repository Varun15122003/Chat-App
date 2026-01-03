/* eslint-disable */
import { useAuthContext } from "../context/AuthContext";
import { useChatContext } from "../context/ChatContext";
import { useEffect, useRef, useState } from "react";
import styles from "./PersonChat.module.css";
import DocumentCard from "./Cards/DocumentCard";
import ShowDocumentCard from "./Cards/ShowDocumentCard";
import FullMediaView from "./FullMediaView"; // 🟢 Import New Component

const PersonChat = () => {
    const { user } = useAuthContext();
    const {
        handleSubmit,
        setText,
        text,
        chatPerson,
        activeUsers,
        fetchMessages,
        isDocumentPreviewActive,
        isFileActive,
        setIsFileActive,
        socket,
    } = useChatContext();

    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [viewMedia, setViewMedia] = useState(null); // 🟢

    const bottomRef = useRef(null);
    const fileActiveRef = useRef(null);
    const plusRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const scrollToEnd = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 🟢 1. LOAD MESSAGES & RESET
    useEffect(() => {
        if (chatPerson?._id && user?._id) {
            setPage(1);
            setMessages([]);
            setHasMore(true);
            loadMessages(1, true);
        }
    }, [chatPerson, user]);

    // 🟢 2. LISTEN FOR INCOMING MESSAGES (From Port 7000)
    // 🟢 2. LISTEN FOR INCOMING MESSAGES (Updated for Duplicate Fix)
    useEffect(() => {
        if (!socket.current) return;

        const handleIncomingMessage = (data) => {
            const incomingMsg = data.message || data;

            // 🟢 DUPLICATE FIX: 
            // Agar ye message maine khud bheja hai, to isse ignore karo.
            // Kyunki 'handleSendLocal' ne isse pehle hi add kar diya hai.
            if (incomingMsg.sender === user._id) return;

            // Check if this message is from the current chat person
            if (chatPerson && (incomingMsg.sender === chatPerson._id)) {
                setMessages((prev) => [...prev, incomingMsg]);
                setTimeout(() => scrollToEnd(), 100);
            }
        };

        socket.current.on("getMessage", handleIncomingMessage);

        return () => {
            socket.current.off("getMessage", handleIncomingMessage);
        };
    }, [chatPerson, user]); // user dependency zaroori hai fix ke liye

    // 🟢 3. MESSAGE PAGINATION
    const loadMessages = async (pageNum, isInitial = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const newMsgs = await fetchMessages(pageNum);

            if (newMsgs && newMsgs.length < 20) {
                setHasMore(false);
            }

            if (isInitial) {
                setMessages(newMsgs);
                setTimeout(() => scrollToEnd(), 100);
            } else {
                const container = chatContainerRef.current;
                const previousHeight = container.scrollHeight;

                setMessages((prev) => [...newMsgs, ...prev]);

                setTimeout(() => {
                    const currentHeight = container.scrollHeight;
                    container.scrollTop = currentHeight - previousHeight;
                }, 0);
            }
        } catch (error) {
            console.error("Error loading messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadMessages(nextPage, false);
        }
    };

    // 🟢 4. SEND MESSAGE LOGIC (API + Socket Emit)
    const handleSendLocal = async (e) => {
        e.preventDefault();

        // 1. Send to API (Port 3000) & Get Message Object
        const newMessage = await handleSubmit(e);

        if (newMessage) {
            // 2. Update Local UI immediately
            setMessages((prev) => [...prev, newMessage]);
            setTimeout(() => scrollToEnd(), 50);

            // 3. Emit to Socket (Port 7000) so the other user gets it
            // Your backend expects: { userTwoId: ..., ... }
            if (socket.current) {
                socket.current.emit("sendMessage", {
                    userTwoId: chatPerson._id,
                    senderId: user._id, // Just in case
                    message: newMessage
                });
            }
        }
    };

    // 🟢 5. MEDIA UPLOAD CALLBACK
    const onUploadSuccess = (newMessage) => {
        if (newMessage) {
            // Update UI
            setMessages((prev) => [...prev, newMessage]);
            setTimeout(() => scrollToEnd(), 50);

            // Emit to Socket
            if (socket.current) {
                socket.current.emit("sendMessage", {
                    userTwoId: chatPerson._id,
                    senderId: user._id,
                    message: newMessage
                });
            }
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFileActive && fileActiveRef.current && !fileActiveRef.current.contains(event.target) && !plusRef.current.contains(event.target)) {
                setIsFileActive(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFileActive]);

    if (!chatPerson) return <div className={styles.container}><img src="chatapp.webp" alt="/" /></div>;

    return (
        <div className={styles.personContainer} >

            <div className={styles.personNavbar}>
                <div className={styles.personDetails}>
                    <div className={styles.person}>
                        <div className={styles.personImage}><img src={chatPerson.profileImage} alt="/" /></div>
                        <div className={styles.personName}>
                            <h2>{chatPerson.name}</h2>
                            <span className={styles.status}>{activeUsers?.find((u) => u?._id === chatPerson?._id) ? "online" : "offline"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isDocumentPreviewActive === true ? (
                <div className={styles.documentPreview}>
                    <ShowDocumentCard onUploadSuccess={onUploadSuccess} />
                </div>
            ) : (
                <div className={styles.showMessage} ref={chatContainerRef} onScroll={handleScroll}>
                    {loading && page > 1 && <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#888' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>}

                    {messages?.map((msg, index) => (
                        <div key={index} className={`${styles.message} ${msg.sender === user._id ? styles.right : styles.left}`}>
                            {msg.messageType === 'text' && <p className={styles.messageText}>{msg.text}</p>}
                            {/* {msg.messageType === 'image' && <img src={msg.mediaUrl} alt="Media" className={styles.messageImage} onLoad={() => { if (page === 1) scrollToEnd() }} />}
                            {msg.messageType === 'video' && <video src={msg.mediaUrl} controls className={styles.messageVideo} />} */}
                            {/* IMAGE */}
                            {msg.messageType === 'image' && (
                                <img
                                    src={msg.mediaUrl}
                                    alt="Media"
                                    className={styles.messageImage}
                                    onLoad={() => { if (page === 1) scrollToEnd() }}
                                    // 🟢 CLICK HANDLER ADDED
                                    onClick={() => setViewMedia({ url: msg.mediaUrl, type: 'image' })}
                                    style={{ cursor: 'pointer' }} // Pointer dikhana zaroori hai
                                />
                            )}

                            {/* VIDEO */}
                            {msg.messageType === 'video' && (
                                <div style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setViewMedia({ url: msg.mediaUrl, type: 'video' })}>

                                    {/* Overlay taaki user play button dabaye to full screen khule */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}></div>

                                    <video
                                        src={msg.mediaUrl}
                                        className={styles.messageVideo}
                                    />
                                </div>
                            )}
                            {msg.messageType === 'audio' && <audio src={msg.mediaUrl} controls className={styles.messageAudio} />}
                            {(msg.messageType === 'document' || msg.messageType === 'pdf') && (() => {
                                const isPdf = msg.mediaUrl?.toLowerCase().includes('.pdf');
                                return (
                                    <div className={styles.messageDocument} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', maxWidth: '280px', width: '170px', border: '1px solid #ddd', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '40px', color: '#555' }}><i style={{ color: '#b83838ff', fontSize: '28px' }} className={isPdf ? "fa-solid fa-file-pdf" : "fa-solid fa-file-lines"}></i></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>{isPdf ? 'PDF File' : 'Document'}</span>
                                            <div style={{ display: 'flex', gap: '20px', marginTop: '2px' }}>
                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ color: '#5080b3ff' }} className="fa-solid fa-eye"></i> View</a>
                                                <a href={msg.mediaUrl ? msg.mediaUrl.replace('/upload/', '/upload/fl_attachment/') : '#'} download style={{ fontSize: '12px', color: '#28a745', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ color: '#28a745' }} className="fa-solid fa-download"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            <p className={styles.messageTime}>{formatTime(msg.time)}</p>
                        </div>
                    ))}
                    <div ref={bottomRef} style={{ float: "left", clear: "both" }} />
                </div>
            )}

            {isFileActive && (
                <div ref={fileActiveRef} onClick={(e) => e.stopPropagation()} className={styles.document}>
                    <DocumentCard />
                </div>
            )}

            {isDocumentPreviewActive === false && <form className={styles.personSearch}>
                <div className={styles.personSearchDetails}>
                    <div className={`${styles.personIcon}`}><div ref={plusRef} className={styles.personIconP} onClick={(e) => { e.stopPropagation(); setIsFileActive((prev) => !prev); }}><i className="fa-solid fa-plus"></i></div></div>
                    <div className={`${styles.personInputSearch}`}><div className={`${styles.personInput}`}><input type="text" placeholder="Type a message" name="message" value={text} onChange={handleChange} required /></div></div>
                    <div className={`${styles.personIcon}`}>
                        {/* 🟢 Using handleSendLocal for Text */}
                        <div className={`${styles.personIconShare}`} onClick={handleSendLocal}><button type='submit' style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><i className="fa-solid fa-share"></i></button></div>
                        <div className={`${styles.personIconM}`}><i className="fa-solid fa-microphone"></i></div>
                    </div>
                </div>
            </form>}
            {viewMedia && (
                <FullMediaView
                    mediaUrl={viewMedia.url}
                    mediaType={viewMedia.type}
                    onClose={() => setViewMedia(null)}
                />
            )}
        </div>
    );
};

export default PersonChat;