// 🟢 Load Environment Variables
require('dotenv').config();

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 7000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 🟢 Change 1: Create an HTTP Server (Koyeb ke load balancer ke liye zaroori)
const server = http.createServer((req, res) => {
    // 🟢 Change 2: Health Check Route (Koyeb check karega ki app live hai ya nahi)
    if (req.url === "/" || req.url === "/health") {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("Socket.io Server is running perfectly on Koyeb!");
    }
});

// 🟢 Change 3: Attach Socket.io to the HTTP Server
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"] // Cloud platform connection stability ke liye
});

let users = [];
const roomMap = {}; // { roomId: [socketId, socketId] }

const addUser = (userData, socketId) => {
    if (!userData || !userData._id) return;
    
    // Pehle agar user exist karta hai to use hatao
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

// 🟢 Change 4: Bind to "0.0.0.0" instead of localhost (Cloud deployment ke liye zaroori)
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Socket Server started on Port ${PORT}`);
    console.log(`🌐 Allowing CORS for: ${CLIENT_URL}`);
});

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
                type: data.type 
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
                
                socket.to(roomID).emit("user-disconnected", socket.id);
            }
            
            if (roomMap[roomID].length === 0) {
                delete roomMap[roomID];
            }
        }
    });
});