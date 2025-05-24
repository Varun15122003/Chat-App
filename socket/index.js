const { Server } = require("socket.io");

const io = new Server(7000, {
    cors: {
        origin: "http://localhost:5173"
    }
})

let users = [];

const addUser = (userData, socketId) => {
    !users.some(user => user?._id == userData?._id) && users.push({ ...userData, socketId });
}

const getUser = (userId) =>{
    return users.find(user => user?._id == userId );
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

io.on('connection', (socket) => {
    console.log("user connected ");

    socket.on("addUsers", userData => {
        addUser(userData, socket.id);
        io.emit('getUsers', users)
    })

    socket.on('sendMessage', data => {
        const user = getUser(data.userTwoId);
        io.to(user?.socketId).emit('getMessage', data);
    })

    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit('getUsers', users);
    });

})

