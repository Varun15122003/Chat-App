const { Server } = require("socket.io");

const io = new Server(7000, {
    cors: {
        origin: "http://localhost:5173"
    }
})

let users = [];
// 🟢 NEW: Map to track users in Group Video Rooms { roomId: [socketId, socketId] }
const roomMap = {};

// Helper: Add User (Text/Presence)
const addUser = (userData, socketId) => {
    !users.some(user => user?._id == userData?._id) && users.push({ ...userData, socketId });
}

// Helper: Get User by MongoDB ID
const getUser = (userId) => {
    return users.find(user => user?._id == userId);
}

// Helper: Remove User (Text/Presence)
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

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
        // data: { userToCall, signalData, from, name }
        // 'userToCall' is the MongoDB ID of the person we are calling
        const user = getUser(data.userToCall);
        
        if (user) {
            io.to(user.socketId).emit("callUser", { 
                signal: data.signalData, 
                from: data.from, // This is the caller's MongoID
                name: data.name 
            });
        }
    });

    socket.on("answerCall", (data) => {
        // data: { to, signal } 
        // 'to' is the Caller's MongoID. We need to find their socket.
        const user = getUser(data.to);
        
        if (user) {
            io.to(user.socketId).emit("callAccepted", data.signal);
        }
    });

    // ==============================
    // 3. GROUP VIDEO CALL (Mesh Topology)
    // ==============================

    socket.on("join-room", (roomID) => {
        // User joins a specific socket room
        socket.join(roomID);

        // Add to roomMap for tracking
        if (!roomMap[roomID]) {
            roomMap[roomID] = [];
        }
        roomMap[roomID].push(socket.id);

        // Get all OTHER users in this room (to start P2P connections)
        const usersInRoom = roomMap[roomID].filter(id => id !== socket.id);
        
        // Send the list of existing users to the new user
        socket.emit("all-users", usersInRoom);
    });

    // New user sends a signal (offer) to an existing user
    socket.on("sending-signal", payload => {
        // payload: { userToSignal, callerID, signal }
        io.to(payload.userToSignal).emit("user-joined", { 
            signal: payload.signal, 
            callerID: payload.callerID 
        });
    });

    // Existing user sends a signal (answer) back to the new user
    socket.on("returning-signal", payload => {
        // payload: { signal, callerID }
        io.to(payload.callerID).emit("receiving-returned-signal", { 
            signal: payload.signal, 
            id: socket.id 
        });
    });

    // ==============================
    // 4. DISCONNECT & CLEANUP
    // ==============================

    socket.on("disconnect", () => {
        console.log("User disconnected");
        
        // 1. Remove from Text/Presence list
        removeUser(socket.id);
        io.emit('getUsers', users);

        // 2. Remove from Group Video Rooms
        for (const roomID in roomMap) {
            // Filter out this socket ID
            roomMap[roomID] = roomMap[roomID].filter(id => id !== socket.id);
            
            // If room is empty, delete it to save memory
            if (roomMap[roomID].length === 0) {
                delete roomMap[roomID];
            }
        }
    });
});