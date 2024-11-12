import { createServer } from 'http';
import { Server } from 'socket.io';
import express from "express"
import { addQuestion, getQuestions } from './controller/excel.controller.js';
import multer from 'multer'

const app = express()
app.use(express.json())
const upload = multer({ dest: 'uploads/' });


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

export const quizes = new Map();
export var quizQuestion = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('create-quiz', ({ quizId, questions }) => {
    quizes.set(String(quizId), {
      host: socket.id,
      players: new Map(),
      questions: questions || [],
      currentQuestion: 0,
      status: 'waiting',
      timer: null
    });
    socket.join(quizId);
    console.log(`quiz created: ${quizId}`);
  });

  socket.on('join-quiz', ({ quizId, playerName }, callback) => {
    const quiz = quizes.get(quizId);

    if (!quiz) {
      callback({ success: false, error: 'quiz not found' });
      return;
    }

    quiz.players.set(socket.id, {
      name: playerName,
      score: 0
    });

    socket.join(quizId);
    io.to(quiz.host).emit('player-joined', {
      id: socket.id,
      name: playerName,
      score: 0
    });

    callback({ success: true });
  });

  socket.on('quiz-action', ({ quizId, action }) => {
    const quiz = quizes.get(quizId);
    if (!quiz || quiz.host !== socket.id) return;

    switch (action) {
      case 'start':
        quiz.status = 'playing';
        io.to(quizId).emit('quiz-started');
        startQuestion(quizId);
        break;
      case 'pause':
        quiz.status = 'paused';
        console.log("pause")
        if (quiz.timer) clearInterval(quiz.timer);
        io.to(quizId).emit('quiz-paused');
        break;
      case 'next':
        quiz.currentQuestion++;
        if (quiz.currentQuestion < quiz.questions.length) {
          startQuestion(quizId);
        } else {
          endquiz(quizId);
        }
        break;
    }
  });

  socket.on('submit-answer', ({ quizId, questionId, answer }) => {
    const quiz = quizes.get(quizId);
    if (!quiz || quiz.status !== 'playing') return;

    const player = quiz.players.get(socket.id);
    if (!player) return;

    const question = quiz.questions[quiz.currentQuestion];
    if (question.id !== questionId) return;
    console.log(answer, question)
    if (answer === question.correctAnswer) {
      player.score += 100;
      io.to(quiz.host).emit('score-update', {
        playerId: socket.id,
        newScore: player.score
      });
    }
  });

  socket.on('get-questions', ({ quizId }) => {
    const quiz = quizes.get(quizId);
    if (!quiz) return;

    io.to(quiz.host).emit('questions', quiz.questions);
  })

  socket.on('disconnect', () => {
    quizes.forEach((quiz, quizId) => {
      if (quiz.host === socket.id) {
        quizes.delete(quizId);
        io.to(quizId).emit('quiz-ended');
      } else if (quiz.players.has(socket.id)) {
        quiz.players.delete(socket.id);
        io.to(quiz.host).emit('player-left', socket.id);
      }
    });
  });
});

function startQuestion(quizId) {
  const quiz = quizes.get(quizId);
  if (!quiz) return;

  const question = quiz.questions[quiz.currentQuestion];
  io.to(quizId).emit('question', question);

  let timeLeft = 20;
  if (quiz.timer) clearInterval(quiz.timer);

  quiz.timer = setInterval(() => {
    timeLeft--;
    io.to(quizId).emit('timer', timeLeft);

    if (timeLeft <= 0) {
      clearInterval(quiz.timer);
      // Move to next question or end quiz
    }
  }, 1000);
}

function endquiz(quizId) {
  const quiz = quizes.get(quizId);
  if (!quiz) return;

  quiz.status = 'finished';
  if (quiz.timer) clearInterval(quiz.timer);

  const results = Array.from(quiz.players.entries()).map(([id, player]) => ({
    id,
    name: player.name,
    score: player.score
  })).sort((a, b) => b.score - a.score);

  io.to(quizId).emit('quiz-ended', { results });
  quizes.delete(quizId);
}

app.get('/', (_req, res) => {
  console.log("hitted check");
  res.send("working");
});

app.post('/add-questions', upload.single('file'), (req, res) => {
  addQuestion(req, res);
  console.log(quizes);
});

app.get('/get-questions', getQuestions);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});