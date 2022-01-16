import type { NextPage } from 'next';
import { useSocket } from '../context/socket.context';

const Home: NextPage = () => {
  const {socket} = useSocket();
  return (
    <p>Socket client id: {socket.id}</p>
  )
}

export default Home;
