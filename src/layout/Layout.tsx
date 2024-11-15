import { Route, Routes } from "react-router-dom";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Home from "../pages/Home";
import CreateGame from "../pages/CreateGame";
import AdminGame from "../pages/AdminGame";
import PlayerGame from "../pages/PlayerGame";
import JoinGame from "../pages/JoinGame";
import LoginForm from "../pages/LoginForm";
import { useGameStore } from "@/store/gameStore";
import {useEffect} from 'react'
import NotFound from '../pages/NotFound'

export default function Layout() {
  const isAunthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    const user = localStorage.getItem("userData");
    if(user) useGameStore.getState().setIsAuthenticated(true);
  },[isAunthenticated])

  return (
    <div className="h-screen grid grid-rows-12 bg-[#EEF7FF]">
      <Header />
      <div className="row-span-11">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Home />} />
          {isAunthenticated ? (
            <>
              <Route path="/admin/:gameId" element={<AdminGame />} />
              <Route path="/create" element={<CreateGame />} />
            </>
          ) : (
            <Route path="/create" element={<LoginForm />} />
          )}
          <Route path="/play/:gameId" element={<PlayerGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
