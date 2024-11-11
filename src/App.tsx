import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGame from './pages/CreateGame';
import AdminGame from './pages/AdminGame';
import PlayerGame from './pages/PlayerGame';
import JoinGame from './pages/JoinGame';
import { SocketProvider } from './context/SocketContext';
import Layout from './layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Layout />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;