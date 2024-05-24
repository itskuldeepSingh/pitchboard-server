// server.js (or your main server file)
const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const PORT = 3001;
const userRoutes = require('./routes/userRoute');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("pitchboard api");
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // client code
        methods: ["GET", "POST"],
    },
});

// Pass io to userRoutes
app.use('/api', (req, res, next) => {
    req.io = io;
    next();
}, userRoutes);

let onlineUsersMap = new Map();

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("login", (userData) => {
        console.log("new user joined", userData);
        onlineUsersMap.set(socket.id, userData);
        io.emit("newUser", Array.from(onlineUsersMap.values()));
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        onlineUsersMap.delete(socket.id);
        io.emit("newUser", Array.from(onlineUsersMap.values()));
    });
});

server.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
