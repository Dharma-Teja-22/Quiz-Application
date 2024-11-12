import { BrowserRouter } from 'react-router-dom';
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