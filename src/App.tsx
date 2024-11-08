import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGame from './pages/CreateGame';
import AdminGame from './pages/AdminGame';
import PlayerGame from './pages/PlayerGame';
import JoinGame from './pages/JoinGame';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/admin/:gameId" element={<AdminGame />} />
          <Route path="/play/:gameId" element={<PlayerGame />} />
          <Route path="/join" element={<JoinGame />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;