import { useSocket } from '../context/socket.context';

import MessagesContainer from '../containers/MessagesContainer';
import RoomsContainer from '../containers/RoomsContainer';
import { useEffect, useRef } from 'react';

import styles from '../styles/Home.module.css';

export default function Home(): JSX.Element {

  const {socket, username, setUsername} = useSocket();
  const usernameRef = useRef<HTMLInputElement>(null);

  function handleSetUsername() {
    const value = usernameRef.current?.value;
    if(!value) {
      return;
    }

    setUsername(value);

    localStorage.setItem("username", value);
  }

  useEffect(() => {
    const current = usernameRef.current;
    if(!current) {
      return;
    }

    current.value = localStorage.getItem("username") || "";
  }, []);

  return (
    <div>

      {!username && (
        <div className={styles.usernameWrapper}>
          <div className={styles.usernameInner}>
            <input placeholder="Username" ref={usernameRef} type="text" />
            <button onClick={handleSetUsername}>Start</button>
          </div>
        </div>
      )}

      {username && (
        <div className={styles.container}>
          <RoomsContainer />
          <MessagesContainer />
        </div>
      )}
    </div>
  );
}
