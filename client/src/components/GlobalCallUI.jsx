/* eslint-disable */
import { useEffect } from 'react';
import { useVideoContext } from '../context/VideoContext';
import VideoCall from './VideoCall';
import styles from './VideoCall.module.css'; // Re-use your css

const GlobalCallUI = () => {
    const { 
        call, 
        callAccepted, 
        isVideoVisible, 
        setVideoVisible, 
        answerCall, 
        myVideo, 
        stream 
    } = useVideoContext();

    // 🟢 FIX FOR BLACK LOCAL SCREEN
    // Whenever the window opens or stream changes, force attach it to the video element
    useEffect(() => {
        if (isVideoVisible && stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [isVideoVisible, stream]);

    // 1. INCOMING CALL NOTIFICATION (Shows anywhere)
    if (call.isReceivedCall && !callAccepted) {
        return (
            <div style={floatingStyles.overlay}>
                <div style={floatingStyles.card}>
                    <h2 style={{margin: '0 0 15px 0', color: '#333'}}>
                        {call.name} is calling...
                    </h2>
                    <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                        <button onClick={answerCall} className={styles.btnAnswer}>
                            Answer <i className="fa-solid fa-phone"></i>
                        </button>
                        <button onClick={() => window.location.reload()} className={styles.btnEnd}>
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. ACTIVE VIDEO CALL WINDOW (Shows anywhere)
    if (isVideoVisible) {
        return (
            <div style={floatingStyles.fullScreenOverlay}>
                 {/* Minimize/Close Button */}
                <button 
                    onClick={() => setVideoVisible(false)} 
                    style={floatingStyles.closeBtn}
                >
                    <i className="fa-solid fa-compress"></i> Minimize
                </button>
                
                {/* Reuse your existing VideoCall Logic, 
                    but we don't need props because Context handles it now */}
                <VideoCall /> 
            </div>
        );
    }

    return null;
};

// Simple inline styles for the global overlay
const floatingStyles = {
    overlay: {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999,
        animation: 'slideUp 0.3s ease'
    },
    card: {
        background: 'white', padding: '20px', borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', textAlign: 'center',
        minWidth: '250px'
    },
    fullScreenOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#111', zIndex: 99999, display: 'flex',
        justifyContent: 'center', alignItems: 'center'
    },
    closeBtn: {
        position: 'absolute', top: '20px', right: '20px', zIndex: 100000,
        background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
        padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'
    }
};

export default GlobalCallUI;