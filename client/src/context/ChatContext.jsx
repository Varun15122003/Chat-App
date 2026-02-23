import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuthContext } from "./AuthContext";
import axios from "axios";
import PropTypes from "prop-types";
import io from "socket.io-client";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

// 🟢 FIX 1: Better Environment Variable Handling with Fallbacks
// Vite me import.meta.env use hota hai. 
// Fallback dena achi practice hai incase .env load na ho paye.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7000";
// Dhyaan dein: Yahan maine /api/chat hata diya hai, use hum requests me add karenge.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatProvider = ({ children }) => {
  const [chatPerson, setChatPerson] = useState(null);
  const [text, setText] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);

  // File Upload States
  const [fileUrl, setFileUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileActive, setIsFileActive] = useState(false);
  const [isDocumentPreviewActive, setIsDocumentPreviewActive] = useState(false);

  const { user } = useAuthContext();
  const socket = useRef(null);

  // 🔹 1. Socket Connection
  useEffect(() => {
    // Agar socket pehle se hai, ya user logged in nahi hai, to aage mat badho
    if (socket.current || !user) return;

    socket.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // 🟢 FIX 2: Security & Session - Credentials send karna zaroori ho sakta hai agar backend me cookies ya session hai
      withCredentials: true 
    });

    // 🟢 FIX 3: Add basic connection event listeners for debugging
    socket.current.on('connect', () => {
        console.log("✅ Socket Connected with ID:", socket.current.id);
        // Connect hone par hi user add karo
        socket.current.emit("addUsers", user);
    });

    socket.current.on('connect_error', (err) => {
        console.error("❌ Socket Connection Error:", err.message);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [user]); // Re-run jab user login/logout ho

  // 🔹 2. Listen for Active Users
  useEffect(() => {
    if (!user || !socket.current) return;

    // Backend emits "getUsers"
    socket.current.on("getUsers", (users) => {
      setActiveUsers(users);
    });

    // Cleanup listener on unmount
    return () => {
        if(socket.current){
             socket.current.off("getUsers");
        }
    }
  }, [user]);


  // 🟢 FIX 4: Centralized Axios Instance (Optional but Highly Recommended)
  // Har request me header pass karne se better hai ek instance banana
  const getAuthHeaders = () => {
      const token = localStorage.getItem("token");
      return {
         headers: { Authorization: token ? `Bearer ${token}` : '' }
      }
  }

  // 🔹 3. Fetch Messages
  const fetchMessages = async (page = 1) => {
    if (!user || !chatPerson) return [];

    try {
      // API_URL ka use kiya aur path manually joda
      const res = await axios.get(
        `${API_URL}/api/chat/${user._id}/${chatPerson._id}?page=${page}&limit=20`,
        getAuthHeaders()
      );

      if (res.status === 200) {
        return res.data.message;
      }
      return [];
    } catch (err) {
      console.error("Fetch message error:", err);
      return [];
    }
  };

  // 🔹 Upload Media Helper
  const uploadMedia = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/uploadMedia`,
        formData,
        {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data', // 🟢 FIX 5: FormData ke liye multipart zaroori hai
          }
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };

  const handleFileUpload = async () => {
    const data = await uploadMedia(selectedFile);
    if (data) {
      return await sendMediaMessage(data.mediaUrl, data.mediaType);
    }
    return null;
  }

  const handleMediaChange = async (e) => {
    const Test = e.target.files[0];
    if (!Test) return;
    setSelectedFile(Test);
    setFileUrl(URL.createObjectURL(Test));
    setIsFileActive(false);
    setIsDocumentPreviewActive(true);
  };

  // 🔹 Send TEXT Message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return null;

    const messageObject = {
      messageType: "text",
      text: text,
      sender: user._id,
      time: new Date(),
    };

    const data = {
      userOneId: user._id,
      userTwoId: chatPerson._id,
      message: messageObject,
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/sendMessage`,
        data,
        getAuthHeaders()
      );

      if (res.status === 200 || res.status === 201) {
        setText("");
        return messageObject;
      }
    } catch (err) {
      console.error("Send message error:", err);
      return null;
    }
  };

  // 🔹 Send MEDIA Message
  const sendMediaMessage = async (mediaUrl, type) => {
    const messageObject = {
      messageType: type,
      mediaUrl,
      sender: user._id,
      time: new Date(),
    };

    const data = {
      userOneId: user._id,
      userTwoId: chatPerson._id,
      message: messageObject,
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/sendMessage`,
        data,
        getAuthHeaders()
      );

      if (res.status === 200) {
        return messageObject;
      }
    } catch (err) {
      console.error("Media send error:", err);
      return null;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatPerson,
        setChatPerson,
        text,
        setText,
        fetchMessages,
        handleSubmit,
        sendMediaMessage,
        socket,
        activeUsers,
        handleMediaChange,
        handleFileUpload,
        fileUrl,
        setFileUrl,
        isDocumentPreviewActive,
        setIsDocumentPreviewActive,
        isFileActive,
        setIsFileActive,
        selectedFile,
        setSelectedFile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ChatProvider;