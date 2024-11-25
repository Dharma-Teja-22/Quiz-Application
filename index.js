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

// app.use(cors({ origin: ["http://172.17.10.127:5173"] }));
app.use(cors())

const upload = multer({ dest: "uploads/" }); // Configure multer for file uploads

const quizzes = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create-game", ({ gameId, questions }) => {
    quizzes.set(gameId, {
      host: socket.id,
      players: new Map(),
      questions: questions || [],
      currentQuestion: 0,
      status: "waiting",
      timer: null,
      timerVal: 10,
    });
    socket.join(gameId);
    console.log(`Game created: ${gameId}`);
    // console.log(quizzes);
  });

  socket.on("create", ({gameId}, callback) => {
    console.log(quizzes,gameId)
    if(quizzes.has(gameId)){
      callback({ success: false, error: "Quiz Id already exists" });
      return;
    }

    callback({ success: true })
  })

  socket.on("verify-room",(quizId,callback) => {
    if(quizzes.has(quizId)){
      callback({ success: true})
    }
    else{
      callback({success:false})
    }
  })

  socket.on("question-status",({gameId, currentQuestion},callback) => {
    const game = quizzes.get(gameId);
    console.log(game)
    if (!game) {
      callback({ success: false, error: "Quiz not found" });
      return;
    }
    const totalPlayers = game.players.size;
    
    
    const question = game.questions[game.currentQuestion];
    console.log(totalPlayers,question,question.id,currentQuestion.id)
    if(question.id === currentQuestion.id){
      callback({success: true,question : question, totalPlayers : totalPlayers})
      return;
    }
  })

  socket.on("getAnswerIndex",({gameId, currentQuestion},callback) => {
    console.log("reveal")
    const game = quizzes.get(gameId);
    if (!game) {
      callback({ success: false, error: "Quiz not found" });
      return;
    }

    const question = game.questions[game.currentQuestion];
    console.log(question);
    if(question.id === currentQuestion.id){
      callback({success: true, answerIndex : question.correctAnswer })
      return;
    }
      callback({success:false})
    return;
  })

  socket.on("join-game", ({ gameId, playerName }, callback) => {
    const game = quizzes.get(gameId);

    if (!game) {
      callback({ success: false, error: "Quiz not found" });
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
    io.emit("player-joined", {
      name: playerName,
      score: 0,
    },gameId);

    callback({ success: true });
  });

  socket.on("status",({gameId,playerName},callback) => {
    // console.log("status called",gameId,quizzes)
    if(quizzes.has(gameId)){
      // console.log("status called")
      const quiz = quizzes.get(gameId);
      if(quiz.players.has(playerName)){
        const playerArray = Array.from(quiz.players.values());

        // Sort players based on their scores in descending order
        const sortedPlayers = playerArray.sort((a, b) => b.score - a.score);
        const playerIndex = sortedPlayers.findIndex((player,index) => player.name === playerName)
        console.log(playerIndex)
        callback({success:true,player:{score : sortedPlayers[playerIndex].score,rank : playerIndex+1}})
      }
      else{
        console.log("player not found")
      }
    }
    else{
      console.log("quizId not fount")
    }
  })

  socket.on("game-action", ({ gameId, action }) => {
    console.log(gameId,action)
    const game = quizzes.get(gameId);
    if (!game) return;
    switch (action) {
      case "start":
        game.status = "playing";
        io.emit("game-started",gameId);
        startQuestion(gameId, "start");
        break;
      case "pause":
        game.status = "paused";
        console.log("pause");
        if (game.timer) clearInterval(game.timer);
        io.emit("game-paused",gameId);
        break;
      case "next":
        console.log("called")
        game.currentQuestion++;
        if (game.currentQuestion < game.questions.length) {
          io.emit("game-started",gameId);
          game.timerVal = 10;
          startQuestion(gameId, "next");
        } else {
          endGame(gameId);
        }
        break;
      case "end":
        io.emit("end",gameId);
        quizzes.delete(gameId);
        console.log("after deleting",quizzes.get(gameId));
        break;
    }
  });

  socket.on("submit-answer", ({ gameId, questionId, answer,playerName,timeLeft }) => {
    console.log("answer recieved");
    const game = quizzes.get(gameId);
    if (!game || game.status !== "playing") return;

    const player = game.players.get(playerName);
    if (!player) return;

    const question = game.questions[game.currentQuestion];
    console.log(question.id, questionId);
    if (question.id !== questionId) return;
    console.log(answer, question);
    game.questions[game.currentQuestion]["options"] = question.options.map(option => option.id === answer ? {...option,count : option.count+1} : option);
    if (answer === question.correctAnswer) {
      player.score += (timeLeft * 10);
      io.emit("score-update", {
        playerName: playerName,
        newScore: player.score,
      },gameId);
    }
  });

  // socket.on("disconnect", () => {
  //   quizzes.forEach((game, gameId) => {
  //     if (game.players.has(socket.id)) {
  //       game.players.delete(socket.id);
  //       io.to(game.host).emit("player-left", socket.id);
  //     }
  //   });
  // });
});

function startQuestion(gameId, type) {
  const game = quizzes.get(gameId);
  if (!game) return;
  const question = game.questions[game.currentQuestion];
  const isFinalQuestion = game.currentQuestion === game.questions.length-1;
  io.emit("question", question, game.timerVal, type, isFinalQuestion,gameId);

  let timeLeft = game.timerVal;
  if (game.timer) clearInterval(game.timer);

  game.timer = setInterval(() => {
    if (timeLeft > 0) timeLeft--;
    game.timerVal = timeLeft;
    io.emit("timer", timeLeft,gameId);
    if (timeLeft <= 0) {

      clearInterval(game.timer);
    }
  }, 1000);
}

function endGame(gameId) {
  const game = quizzes.get(gameId);
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
  quizzes.delete(gameId);
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
        options: [{id : 0,content : item.Option1,count : 0}, {id : 1,content : item.Option2,count : 0}, {id : 2,content : item.Option3,count : 0}, {id : 3,content : item.Option4,count : 0}],
        correctAnswer: item.Answer - 1, // Adjust answer to zero-based index
      };
    });

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
  console.log(quizzes)
  const quiz = quizzes.get(req.query.quizId)
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
