import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from "express"
import { addQuestion } from './controller/excel.controller.js';
import multer from 'multer'

const app = express()
app.use(express.json())
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename); // Removed unused variable

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

export const games = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('create-game', ({ gameId, questions }) => {
    games.set(gameId, {
      host: socket.id,
      players: new Map(),
      questions: questions || [],
      currentQuestion: 0,
      status: 'waiting',
      timer: null
    });
    socket.join(gameId);
    console.log(`Game created: ${gameId}`);
  });

  socket.on('join-game', ({ gameId, playerName }, callback) => {
    const game = games.get(gameId);

    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }

    game.players.set(socket.id, {
      name: playerName,
      score: 0
    });

    socket.join(gameId);
    io.to(game.host).emit('player-joined', {
      id: socket.id,
      name: playerName,
      score: 0
    });

    callback({ success: true });
  });

  socket.on('game-action', ({ gameId, action }) => {
    const game = games.get(gameId);
    if (!game || game.host !== socket.id) return;

    switch (action) {
      case 'start':
        game.status = 'playing';
        io.to(gameId).emit('game-started');
        startQuestion(gameId);
        break;
      case 'pause':
        game.status = 'paused';
        console.log("pause")
        if (game.timer) clearInterval(game.timer);
        io.to(gameId).emit('game-paused');
        break;
      case 'next':
        game.currentQuestion++;
        if (game.currentQuestion < game.questions.length) {
          startQuestion(gameId);
        } else {
          endGame(gameId);
        }
        break;
    }
  });

  socket.on('submit-answer', ({ gameId, questionId, answer }) => {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;

    const player = game.players.get(socket.id);
    if (!player) return;

    const question = game.questions[game.currentQuestion];
    if (question.id !== questionId) return;
    console.log(answer, question)
    if (answer === question.correctAnswer) {
      player.score += 100;
      io.to(game.host).emit('score-update', {
        playerId: socket.id,
        newScore: player.score
      });
    }
  });

  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      if (game.host === socket.id) {
        games.delete(gameId);
        io.to(gameId).emit('game-ended');
      } else if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        io.to(game.host).emit('player-left', socket.id);
      }
    });
  });
});

function startQuestion(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const question = game.questions[game.currentQuestion];
  io.to(gameId).emit('question', question);

  let timeLeft = 20;
  if (game.timer) clearInterval(game.timer);

  game.timer = setInterval(() => {
    timeLeft--;
    io.to(gameId).emit('timer', timeLeft);

    if (timeLeft <= 0) {
      clearInterval(game.timer);
      // Move to next question or end game
    }
  }, 1000);
}

function endGame(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  game.status = 'finished';
  if (game.timer) clearInterval(game.timer);

  const results = Array.from(game.players.entries()).map(([id, player]) => ({
    id,
    name: player.name,
    score: player.score
  })).sort((a, b) => b.score - a.score);

  io.to(gameId).emit('game-ended', { results });
  games.delete(gameId);
}

app.get('/', (req, res) => {
  console.log("hitted check");
  res.send("working");
});

app.post('/add-question', upload.single('file'), (req, res) => {
  addQuestion(req, res);
});


const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});