import logo from '../../assets/miracle.png';
import { LogOutIcon } from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import { useContext } from 'react';


export default function Header() {
  const gameId = useGameStore((state) => state.gameId);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const isAunthenticated = useGameStore((state) => state.isAuthenticated);

  const handleLogout = () => {
    console.log(gameId);
    socket && socket.emit('game-action', { gameId, action: 'end' });
    useGameStore.getState().clearState();
    localStorage.clear();
    navigate("/");
  }
  return (
    <div className='p-2 row-span-1 bg-white flex justify-between'>
      <div>
        <img src={logo} width={150} alt="" />
      </div>
      {
        isAunthenticated && <div onClick={handleLogout} className='flex justify-center items-center '>
        <LogOutIcon className='h-5 w-5 mr-1' /> Logout
      </div>
      }
      
    </div>
  )
}
