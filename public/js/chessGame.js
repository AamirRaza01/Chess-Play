// const { Chess } = require("chess.js");
const socket = io();

// frontend se ek event bheja , kahaa..?, server ke pass
// socket.emit("message")

//frontend ko woh mila , to kuchh perform karo
// socket.on("group message", function(){
//     console.log("group message recieved")
// })

const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex; // ye dono kya hai?
      squareElement.dataset.col = squareIndex;

      if (square) {
        const peiceElement = document.createElement("div");
        peiceElement.classList.add(
          "peice",
          square.color === "w" ? "white" : "black"
        );

        peiceElement.innerText = getPeiceUnicode(square);
        peiceElement.draggable = playerRole === square.color; // code nahi samjh aya

        peiceElement.addEventListener("dragstart", (e) => {
          if (peiceElement.draggable) {
            draggedPiece = peiceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", ""); // ye kya hai???
          }
        });

        peiceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(peiceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
        }

        handleMove(sourceSquare, targetSource);
      });
      boardElement.appendChild(squareElement)
    });
  });

  if(playerRole === "b"){
    boardElement.classList.add("flipped")
  }else{
    boardElement.classList.remove("flipped")
  }
};

const handleMove = (source, target) => {
  const move = {
    from : `${String.fromCharCode(97 + source.col)}${8 - source.row}` ,
    to : `${String.fromCharCode(97 + target.col)}${8 - target .row}`  ,
    promotion : 'q'
  }

  socket.emit("move", move)
};

const getPeiceUnicode = (peice) => {
  const unicodePeices = {
    p : "♙",
    r : "♖",
    n : "♘",
    b : "♗",
    q : "♕",
    k : "♔",
    P : "♟︎",
    R : "♜",
    N : "♞",
    Q : "♛",
    K : "♚"
  }
  return unicodePeices[peice.type] || "";
};

socket.on("playerRole", function(role) {
  playerRole = role;
  renderBoard();
})

socket.on("spectatorRole", function() {
  playerRole = null;
  renderBoard();
})

socket.on("boardState", function(fen) {
  chess.load(fen);
  renderBoard();
})

socket.on("move", function(move) {
  chess.move(move);
  renderBoard();
})

renderBoard();
