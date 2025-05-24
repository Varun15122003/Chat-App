import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthContext } from './AuthContext';
import axios from 'axios';
import PropTypes from 'prop-types';
import io from 'socket.io-client'
const ChatContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useChatContext = () => useContext(ChatContext);

const ChatProvider = ({ children }) => {
    const [chatPerson, setChatPerson] = useState(null);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [incomingMessage, setIncomingMessage] = useState(null);
    const { user } = useAuthContext();

    const socket = useRef();

    useEffect(() => {
        socket.current = io('ws://localhost:7000')
    }, [])


    console.log(socket)

    useEffect(() => {
        socket.current.emit("addUsers", user);
        socket.current.on('getUsers', users => {
            console.log(users)
            setActiveUsers(users);
        })

    }, [user])
    useEffect(() => {
        console.log(socket)
        socket?.current.on('getMessage', async (data) => {
            console.log(data);
            setIncomingMessage(data.message);
        });
    }, [socket])

    const fetchMessages = async () => {
        if (!user || !chatPerson) return;

        try {
            const response = await axios.get(`http://localhost:3000/api/chat/${user?._id}/${chatPerson?._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log(response)
            if (response.status === 200) {
                setMessages(response.data.message);
            } else {
                console.log("Error while fetching messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    console.log(messages)

    useEffect(() => {
        console.log(incomingMessage);
        if (
            incomingMessage &&
            chatPerson
        ) {
            setMessages(prev => [...prev, incomingMessage]);
        }
    }, [incomingMessage, chatPerson]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            userOneId: user?._id,
            userTwoId: chatPerson?._id,
            message: {
                text: text,
                date: new Date().toISOString(),
                sender: user?._id,
            },
        };

        try {
            const response = await axios.post('http://localhost:3000/api/chat/sendMessage', data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.status === 200) {
                console.log("Message sent successfully");
                socket.current.emit('sendMessage', data)
                await fetchMessages()
                setText('');
            } else {
                console.log("Error while sending message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                chatPerson,
                setChatPerson,
                text,
                setText,
                messages,
                setMessages,
                fetchMessages,
                handleSubmit,
                socket,
                activeUsers,
                setActiveUsers,
                incomingMessage,
                setIncomingMessage,
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
