/* eslint-disable */
import { createContext, useState, useRef, useEffect, useContext } from 'react';
import Peer from 'simple-peer';
import { useAuthContext } from './AuthContext';
import { useChatContext } from './ChatContext'; 

const VideoContext = createContext();
export const useVideoContext = () => useContext(VideoContext);

export const VideoProvider = ({ children }) => {
    const { user } = useAuthContext();
    const { socket } = useChatContext(); 

    const [stream, setStream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isGroupCall, setIsGroupCall] = useState(false);
    
    // 🟢 Global State for Video Window & Type
    const [isVideoVisible, setVideoVisible] = useState(false);
    const [callType, setCallType] = useState('video'); // 'video' or 'audio'

    const [peers, setPeers] = useState([]); 
    
    const myVideo = useRef();
    const userVideo = useRef(); 
    const connectionRef = useRef(); 
    const peersRef = useRef([]); 

    useEffect(() => {
        if (!socket.current) return;

        socket.current.on('me', (id) => setMe(id));

        socket.current.on('callUser', (data) => {
            console.log("Incoming Call from:", data.name);
            setCall({ isReceivedCall: true, from: data.from, name: data.name, signal: data.signal, type: data.type });
            setCallType(data.type || 'video');
        });

        // 🟢 FIX: Removed 'setupMedia()' from here. 
        // Now camera won't start automatically on page load.

        return () => {
            if (socket.current) {
                socket.current.off('me');
                socket.current.off('callUser');
                socket.current.off('callAccepted');
                socket.current.off('all-users');
                socket.current.off('user-joined');
                socket.current.off('receiving-returned-signal');
            }
        };
    }, [socket.current]);

    // 🟢 Modified: Setup Media (Manual Trigger)
    const setupMedia = async (type = 'video') => {
        try {
            const constraints = type === 'video' 
                ? { video: true, audio: true } 
                : { video: false, audio: true };
            
            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);
            
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Camera/Mic permission denied!"); 
            return null;
        }
    };

    // P2P: Answer Call
    const answerCall = async () => {
        setVideoVisible(true);
        setCallAccepted(true);

        // 🟢 Get Stream only when answering
        const currentStream = await setupMedia(call.type || 'video');
        if(!currentStream) return;

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data) => {
            socket.current.emit('answerCall', { signal: data, to: call.from });
        });

        peer.on('stream', (remoteStream) => {
            // Wait slightly for UI to render
            setTimeout(() => {
                if (userVideo.current) userVideo.current.srcObject = remoteStream;
            }, 1000);
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    // P2P: Call User
    const callUser = async (id, type = 'video') => {
        setCallType(type);
        setVideoVisible(true);
        
        // 🟢 Get Stream only when calling
        const currentStream = await setupMedia(type);
        if(!currentStream) return;

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data) => {
            socket.current.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: user._id,
                name: user.name,
                type: type // 🟢 Send type (audio/video)
            });
        });

        peer.on('stream', (remoteStream) => {
             // Wait slightly for UI to render
             setTimeout(() => {
                if (userVideo.current) userVideo.current.srcObject = remoteStream;
            }, 1000);
        });

        socket.current.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    // GROUP: Join Room
    const joinGroupChat = async (roomID, type = 'video') => {
        setIsGroupCall(true);
        setCallType(type);
        setVideoVisible(true);

        // 🟢 Get Stream only when joining group
        const currentStream = await setupMedia(type);
        if(!currentStream) return;

        if(socket.current) socket.current.emit("join-room", roomID);

        socket.current.on("all-users", (users) => {
            const peersList = [];
            users.forEach(userID => {
                const peer = createPeer(userID, socket.current.id, currentStream);
                peersRef.current.push({ peerID: userID, peer });
                peersList.push({ peerID: userID, peer });
            });
            setPeers(peersList);
        });

        socket.current.on("user-joined", payload => {
            const peer = addPeer(payload.signal, payload.callerID, currentStream);
            peersRef.current.push({ peerID: payload.callerID, peer });
            setPeers(users => [...users, { peerID: payload.callerID, peer }]);
        });

        socket.current.on("receiving-returned-signal", payload => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            if(item) item.peer.signal(payload.signal);
        });
    };

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on("signal", signal => {
            socket.current.emit("sending-signal", { userToSignal, callerID, signal });
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on("signal", signal => {
            socket.current.emit("returning-signal", { signal, callerID });
        });

        peer.signal(incomingSignal);
        return peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        setVideoVisible(false);
        if (connectionRef.current) connectionRef.current.destroy();
        
        peersRef.current.forEach(p => p.peer.destroy());
        peersRef.current = [];
        setPeers([]);

        window.location.reload(); 
    };

    return (
        <VideoContext.Provider value={{
            call, callAccepted, myVideo, userVideo, stream, name: user?.name,
            callEnded, me, callUser, answerCall, leaveCall,
            joinGroupChat, peers, isGroupCall,
            isVideoVisible, setVideoVisible, callType // 🟢 Export callType
        }}>
            {children}
        </VideoContext.Provider>
    );
};