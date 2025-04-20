import { Server } from "socket.io"
import http from "http"
import express from "express"


const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
})


export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}


// Store online users
// {userId: socketId} User id as the key and socket as the value
const userSocketMap = {

}



io.on("connection", (socket) => {
  console.log("User is connected", socket.id);

  const userId = socket.handshake.query.userId
  if (userId) userSocketMap[userId] = socket.id

  // io.emit() Sends events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  socket.on("disconnect", () => {
    console.log("User is diconnected", socket.id)
    delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})



export { io, app, server }