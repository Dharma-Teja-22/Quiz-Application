import { Route, Routes } from "react-router-dom";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Home from "../pages/Home";
import CreateGame from "../pages/CreateGame";
import AdminGame from "../pages/AdminGame";
import PlayerGame from "../pages/PlayerGame";
import JoinGame from "../pages/JoinGame";

export default function Layout() {
  return (
    <div className="h-screen grid grid-rows-12">
        <Header />
        <div className="row-span-11">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateGame />} />
                <Route path="/admin/:gameId" element={<AdminGame />} />
                <Route path="/play/:gameId" element={<PlayerGame />} />
                <Route path="/join" element={<JoinGame />} />
            </Routes>
        </div>    
        <Footer />
    </div>
  )
}
