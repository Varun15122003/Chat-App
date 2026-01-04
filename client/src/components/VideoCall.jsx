/* eslint-disable */
import { useEffect, useRef } from 'react';
import { useVideoContext } from '../context/VideoContext';
import styles from './VideoCall.module.css';

// Helper Component for Group Video (Remote Peers)
const Video = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [peer]);
    return <video playsInline autoPlay ref={ref} className={styles.groupVideo} />;
};

const VideoCall = () => {
    // 🟢 1. Context se saara data lijiye (Props ki zaroorat nahi)
    const { 
        name, 
        callAccepted, 
        myVideo, 
        userVideo, 
        callEnded, 
        stream, 
        call, 
        peers, 
        isGroupCall 
    } = useVideoContext();

    // 🟢 2. FORCE ATTACH STREAM (Black Screen Fix)
    // Ye code ensure karta hai ki camera load hote hi video element se jud jaye.
    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
                
                {/* LOCAL VIDEO (MY CAMERA) */}
                <div className={styles.myVideoCard}>
                    <p>{name || 'Me'}</p>
                    {stream ? (
                        // 'muted' zaroori hai taaki khud ki awaaz wapas na aaye
                        <video playsInline muted ref={myVideo} autoPlay className={styles.video} />
                    ) : (
                        <div style={{color: 'white', display:'flex', height:'100%', justifyContent:'center', alignItems:'center'}}>
                            <i className="fa-solid fa-spinner fa-spin" style={{marginRight:'10px'}}></i> Loading Camera...
                        </div>
                    )}
                </div>

                {/* P2P: REMOTE USER VIDEO (1-ON-1) */}
                {callAccepted && !callEnded && !isGroupCall && (
                    <div className={styles.userVideoCard}>
                        <p>{call.name || 'User'}</p>
                        <video playsInline ref={userVideo} autoPlay className={styles.video} />
                    </div>
                )}

                {/* GROUP: REMOTE USERS VIDEOS */}
                {isGroupCall && peers.map((peerObj, index) => (
                    <div key={index} className={styles.userVideoCard}>
                        <Video peer={peerObj.peer} />
                    </div>
                ))}
            </div>

            {/* CONTROLS (Floating Bottom Bar) */}
            <div className={styles.controls}>
                {/* Sirf 'End Call' button dikhayenge, kyunki 'Answer' popup alag hai */}
                <button 
                    onClick={() => window.location.reload()} 
                    className={styles.btnEnd}
                    title="Disconnect"
                >
                    <i className="fa-solid fa-phone-slash"></i> End Call
                </button>
            </div>
        </div>
    );
};

export default VideoCall;