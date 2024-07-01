// Import: express, http, socket.io, chess.js
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { title } = require("process");

// Create Express app instance
const app = express(); // express ka server banaya , then http ka server banaya
// connect it with express ka server. Now socekt will communicate with http ka server.

// Initialize HTTP server with Express
const server = http.createServer(app);

// Instantiate Socket.io on HTTP server
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (uniqueSocket) {
  // console.log("conneted");

  // uniqueSocket.on("message", () => {
  //     io.emit("group message")     //frontend ko wapas bhej diya
  // })

  //on recieving disconnect event
  // uniqueSocket.on("disconnect", () => {
  //     console.log("disconnected/offline")
  // })

  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  uniqueSocket.on("disconnect", () => {
    if (uniqueSocket.id === players.white) {
      delete players.white;
    } else if (uniqueSocket.id === players.black) {
      delete players.black;
    }
  });

  uniqueSocket.on("move", (move) => {
    try {
      //white wala chalne ke bad turant koi aur move nahi kar skta
      if (chess.turn() === "w" && uniqueSocket.id === !players.white) return;
      if (chess.turn() === "b" && uniqueSocket.id === !players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move", move);
        uniqueSocket.emit("invalidMove", move);
      }
    } catch (error) {
      console.log(error);
      uniqueSocket.emit("Invalid move : ", move);
    }
  });
});

server.listen(3000, () => {
  console.log("server running");
});
