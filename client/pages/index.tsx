import type { NextPage } from 'next';
import { useSocket } from '../context/socket.context';

import MessagesContainer from '../containers/MessagesContainer';
import RoomsContainer from '../containers/RoomsContainer';
import { useRef } from 'react';

export default function Home(): JSX.Element {
  const {socket, username, setUsername} = useSocket();
  const usernameRef = useRef<HTMLInputElement>(null);

  function handleSetUsername() {
    const value = usernameRef?.current?.value;
    if(!value) {
      return;
    }

    setUsername(value);

    localStorage.setItem("username", value);
  }

  return (
    <div>

      {!username && (
        <div>
          <input placeholder="Username" ref={usernameRef} type="text" />
          <button onClick={handleSetUsername}>Start</button>
        </div>
      )}

      <RoomsContainer />
      <MessagesContainer />
    </div>
  );
}
