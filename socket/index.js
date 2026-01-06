// 🟢 Change 1: Load Environment Variables
require('dotenv').config();

const { Server } = require("socket.io");

// 🟢 Change 2: Use Dynamic Port & Origin
const PORT = process.env.PORT || 7000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(PORT, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

let users = [];
const roomMap = {}; // { roomId: [socketId, socketId] }

// 🟢 Change 3: Fix addUser Logic (Update Socket ID on Refresh)
const addUser = (userData, socketId) => {
    if (!userData || !userData._id) return;
    
    // Pehle agar user exist karta hai to use hatao (taaki purana socket ID hat jaye)
    users = users.filter(user => user._id !== userData._id);
    
    // Ab naye socket ID ke saath add karo
    users.push({ ...userData, socketId });
}

const getUser = (userId) => {
    return users.find(user => user?._id == userId);
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

console.log(`🚀 Socket Server started on Port ${PORT}`);
console.log(`🌐 Allowing CORS for: ${CLIENT_URL}`);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ==============================
    // 1. TEXT CHAT & PRESENCE
    // ==============================

    socket.on("addUsers", userData => {
        addUser(userData, socket.id);
        io.emit('getUsers', users);
    });

    socket.on('sendMessage', data => {
        const user = getUser(data.userTwoId);
        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        }
    });

    // ==============================
    // 2. P2P VIDEO CALL (1-on-1)
    // ==============================

    socket.on("callUser", (data) => {
        const user = getUser(data.userToCall);
        
        if (user) {
            io.to(user.socketId).emit("callUser", { 
                signal: data.signalData, 
                from: data.from, 
                name: data.name,
                type: data.type // 🟢 Change 4: Pass 'type' (audio/video)
            });
        }
    });

    socket.on("answerCall", (data) => {
        const user = getUser(data.to);
        
        if (user) {
            io.to(user.socketId).emit("callAccepted", data.signal);
        }
    });

    // ==============================
    // 3. GROUP VIDEO CALL
    // ==============================

    socket.on("join-room", (roomID) => {
        socket.join(roomID);

        if (!roomMap[roomID]) {
            roomMap[roomID] = [];
        }
        // Prevent duplicates
        if (!roomMap[roomID].includes(socket.id)) {
            roomMap[roomID].push(socket.id);
        }

        const usersInRoom = roomMap[roomID].filter(id => id !== socket.id);
        socket.emit("all-users", usersInRoom);
    });

    socket.on("sending-signal", payload => {
        io.to(payload.userToSignal).emit("user-joined", { 
            signal: payload.signal, 
            callerID: payload.callerID 
        });
    });

    socket.on("returning-signal", payload => {
        io.to(payload.callerID).emit("receiving-returned-signal", { 
            signal: payload.signal, 
            id: socket.id 
        });
    });

    // ==============================
    // 4. DISCONNECT & CLEANUP
    // ==============================

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        
        removeUser(socket.id);
        io.emit('getUsers', users);

        // Group Cleanup
        for (const roomID in roomMap) {
            if (roomMap[roomID].includes(socket.id)) {
                roomMap[roomID] = roomMap[roomID].filter(id => id !== socket.id);
                
                // 🟢 Change 5: Notify others in room to remove video
                socket.to(roomID).emit("user-disconnected", socket.id);
            }
            
            if (roomMap[roomID].length === 0) {
                delete roomMap[roomID];
            }
        }
    });
});