import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuthContext } from "./AuthContext";
import axios from "axios";
import PropTypes from "prop-types";
import io from "socket.io-client";

const ChatContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useChatContext = () => useContext(ChatContext);

// // 🟢 SOCKET PORT (7000)
// const SOCKET_URL = "http://localhost:7000";
// // 🟢 API PORT (3000)
// const API_URL = "http://localhost:3000/api/chat";
// 🟢 Development aur Production dono ke liye auto-switch hoga
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_CHAT_API_URL;

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

  // 🔹 1. Socket Connection (Optimized for React Strict Mode)
  useEffect(() => {
    // Agar socket pehle se connected hai to naya mat banao
    if (socket.current) return;

    socket.current = io(SOCKET_URL, {
      transports: ['websocket'],      // Polling error fix
      reconnection: true,             // Auto reconnect enable
      reconnectionAttempts: 5,        // Max 5 attempts
      reconnectionDelay: 1000,        // 1 sec delay
    });

    return () => {
      // Cleanup: Disconnect on unmount
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    }
  }, []);

  // 🔹 2. Add User & Listen for Active Users
  useEffect(() => {
    if (!user || !socket.current) return;

    // Backend expects "addUsers"
    socket.current.emit("addUsers", user);

    // Backend emits "getUsers"
    socket.current.on("getUsers", (users) => {
      setActiveUsers(users);
    });
  }, [user]);


  // 🔹 3. Fetch Messages (API Port 3000)
  const fetchMessages = async (page = 1) => {
    if (!user || !chatPerson) return [];

    try {
      const res = await axios.get(
        `${API_URL}/${user._id}/${chatPerson._id}?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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

  // 🔹 Upload Media Helper (API Port 3000)
  const uploadMedia = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await axios.post(
        `${API_URL}/uploadMedia`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
  };

  // 🔹 Handle File Upload Logic (Called by UI)
  const handleFileUpload = async () => {
    const data = await uploadMedia(selectedFile);
    if (data) {
      // Media upload hone ke baad message bhejo
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

  // 🔹 Send TEXT Message (API Port 3000)
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
        `${API_URL}/sendMessage`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        setText("");
        return messageObject; // Return for UI update
      }
    } catch (err) {
      console.error("Send message error:", err);
      return null;
    }
  };

  // 🔹 Send MEDIA Message (API Port 3000)
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
        `${API_URL}/sendMessage`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        return messageObject; // Return for UI update
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
        selectedFile,      // Exported for ShowDocumentCard
        setSelectedFile,   // Exported for ShowDocumentCard
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