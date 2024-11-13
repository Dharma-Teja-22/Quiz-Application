import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import xlsx from "xlsx";
import express from "express";
import multer from "multer";
import cors from "cors";

let quizData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: ["http://localhost:5173"] }));

const upload = multer({ dest: "uploads/" }); // Configure multer for file uploads

const games = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create-game", ({ gameId, questions }) => {
    games.set(gameId, {
      host: socket.id,
      players: new Map(),
      questions: questions || [],
      currentQuestion: 0,
      status: "waiting",
      timer: null,
      timerVal: 20,
    });
    socket.join(gameId);
    console.log(`Game created: ${gameId}`);
    // console.log(games);
  });

  socket.on("join-game", ({ gameId, playerName }, callback) => {
    const game = games.get(gameId);

    if (!game) {
      callback({ success: false, error: "Game not found" });
      return;
    }

    if (game.players.has(playerName)) {
      callback({ success: false, error: "Username already exists" });
      return;
    }

    game.players.set(playerName, {
      name: playerName,
      score: 0,
    });
    console.log(game.players)

    socket.join(gameId);
    io.to(game.host).emit("player-joined", {
      name: playerName,
      score: 0,
    });

    callback({ success: true });
  });

  socket.on("game-action", ({ gameId, action }) => {
    const game = games.get(gameId);
    if (!game || game.host !== socket.id) return;
    switch (action) {
      case "start":
        game.status = "playing";
        io.to(gameId).emit("game-started");
        startQuestion(gameId, "start");
        break;
      case "pause":
        game.status = "paused";
        console.log("pause");
        if (game.timer) clearInterval(game.timer);
        io.to(gameId).emit("game-paused");
        break;
      case "next":
        game.currentQuestion++;
        if (game.currentQuestion < game.questions.length) {
          game.timerVal = 20;
          startQuestion(gameId, "next");
        } else {
          endGame(gameId);
        }
        break;
      case "end":
        io.to(gameId).emit("end");
        games.forEach((game, gameId) => {
          if (game.host === socket.id) {
            games.delete(gameId);
            io.to(gameId).emit("game-ended");
          }})
        break;
    }
  });

  socket.on("submit-answer", ({ gameId, questionId, answer,playerName }) => {
    console.log("answer recieved");
    const game = games.get(gameId);
    if (!game || game.status !== "playing") return;

    const player = game.players.get(playerName);
    if (!player) return;

    const question = game.questions[game.currentQuestion];
    console.log(question.id, questionId);
    if (question.id !== questionId) return;
    console.log(answer, question);
    if (answer === question.correctAnswer) {
      player.score += 100;
      io.to(game.host).emit("score-update", {
        playerName: playerName,
        newScore: player.score,
      });
    }
  });

  // socket.on("disconnect", () => {
  //   games.forEach((game, gameId) => {
  //     if (game.players.has(socket.id)) {
  //       game.players.delete(socket.id);
  //       io.to(game.host).emit("player-left", socket.id);
  //     }
  //   });
  // });
});

function startQuestion(gameId, type) {
  const game = games.get(gameId);
  if (!game) return;

  const question = game.questions[game.currentQuestion];
  const isFinalQuestion = game.currentQuestion === game.questions.length-1;
  io.to(gameId).emit("question", question, game.timeLeft, type, isFinalQuestion);

  let timeLeft = game.timerVal;
  if (game.timer) clearInterval(game.timer);

  game.timer = setInterval(() => {
    if (timeLeft > 0) timeLeft--;
    game.timerVal = timeLeft;
    io.to(gameId).emit("timer", timeLeft);
    io.to(game.host).emit("timer", timeLeft);
    if (timeLeft <= 0) {
      clearInterval(game.timer);
    }
  }, 1000);
}

function endGame(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  game.status = "finished";
  if (game.timer) clearInterval(game.timer);

  const results = Array.from(game.players.entries())
    .map(([id, player]) => ({
      id,
      name: player.name,
      score: player.score,
    }))
    .sort((a, b) => b.score - a.score);

  io.to(gameId).emit("game-ended", { results });
  games.delete(gameId);
}

// New API endpoint to upload and convert Excel to JSON
app.post("/api/upload-excel", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.query.quizId) {
      return res.status(400).json({ error: "No gameId uploaded" });
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheets = workbook.SheetNames;

    const allData = sheets.flatMap((sheetName) =>
      xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
    );
    // console.log(allData);
    const allDataNew = allData.map((item) => {
      return {
        id: item.Id,
        question: item.Question,
        options: [item.Option1, item.Option2, item.Option3, item.Option4],
        correctAnswer: item.Answer - 1, // Adjust answer to zero-based index
      };
    });
    // Use gameId as the key in the JSON response
    // quizData = {
    //   ...quizData,
    //   [req.body.quizId]: allDataNew,
    // };

    res.json({
      questions: allDataNew,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process Excel file" });
  }
});

app.get("/api/qna", (req, res) => {
  if (!req.query.quizId) {
    return res.status(400).json({ error: "No gameId uploaded" });
  }
  // const quiz = quizData[req.query.gameId];
  console.log(games)
  const quiz = games.get(req.query.quizId)
  if(quiz){
    console.log(quiz)
    res.json(quiz.questions);
  }
  if (!quiz) {
    return res.status(404).json({ error: "Game ID not found" });
  }

});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
