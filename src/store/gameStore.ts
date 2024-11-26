import { create } from 'zustand';

export interface Option {
  id : number;
  content : string,
  count : number
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: number;
  showAnswer : boolean
}

export interface Player {
  name: string;
  score: number;
}

interface GameState {
  gameId: string | null;
  isAuthenticated : boolean;
  playerName: string;
  isAdmin: boolean;
  currentQuestion: number;
  score: number;
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished';
  questions: Question[];
  students : Player[];
  setGameId: (id: string) => void;
  setIsAuthenticated : (value : boolean) => void;
  setPlayerName: (name: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setCurrentQuestion: (questionNum: number) => void;
  updateScore: (points: number) => void;
  setGameStatus: (status: 'waiting' | 'playing' | 'paused' | 'finished') => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  removeQuestion: (id: number) => void;
  setQuestions: (questions: Question[]) => void;
  setStudents : (students : Player[]) => void;
  clearState : () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  isAuthenticated : false,
  playerName: '',
  isAdmin: false,
  currentQuestion: 0,
  score: 0,
  gameStatus: 'waiting',
  questions: [],
  students : [],
  setGameId: (id) => set({ gameId: id }),
  setIsAuthenticated : (value) => set({isAuthenticated : value}),
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
  setQuestions: (questions) => set({ questions }),
  setStudents : (students) => set({students}),
  clearState : () => set({gameId: null,
    isAuthenticated : false,
    playerName: '',
    isAdmin: false,
    currentQuestion: 0,
    score: 0,
    gameStatus: 'waiting',
    questions: [],
    students : []})
}));