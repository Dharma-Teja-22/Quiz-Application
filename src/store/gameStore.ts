import { create } from 'zustand';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GameState {
  gameId: string | null;
  playerName: string;
  isAdmin: boolean;
  currentQuestion: number;
  score: number;
  gameStatus: 'waiting' | 'playing' | 'paused' | 'end';
  questions: Question[];
  setGameId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setCurrentQuestion: (questionNum: number) => void;
  updateScore: (points: number) => void;
  setGameStatus: (status: 'waiting' | 'playing' | 'paused' | 'end') => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  removeQuestion: (id: number) => void;
  setQuestions: (questions: Question[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  playerName: '',
  isAdmin: false,
  currentQuestion: 0,
  score: 0,
  gameStatus: 'waiting',
  questions: [],
  setGameId: (id) => set({ gameId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setCurrentQuestion: (questionNum) => set({ currentQuestion: questionNum }),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  setGameStatus: (status) => set({ gameStatus: status }),
  addQuestion: (question) => set((state) => ({
    questions: [...state.questions, { ...question, id: Date.now() }]
  })),
  removeQuestion: (id) => set((state) => ({
    questions: state.questions.filter(q => q.id !== id)
  })),
  setQuestions: (questions) => set({ questions })
}));