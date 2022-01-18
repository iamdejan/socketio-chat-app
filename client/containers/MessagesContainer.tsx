import React, { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { useSocket } from "../context/socket.context";

import styles from '../styles/Messages.module.css';

function MessagesContainer(): JSX.Element {

  const {socket, roomId, username, messages, setMessages} = useSocket();
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  function handleSendMessage(e: React.SyntheticEvent) {
    e.preventDefault();

    const message = messageRef.current?.value;
    if(!message) {
      return;
    }

    socket.emit(EVENTS.CLIENT.send_message, {roomId, message, username});

    const date = new Date();
    setMessages([
      ...messages,
      {
        username: "You",
        message: message,
        time: `${date.getHours()}:${date.getMinutes()}`
      }
    ]);

    messageRef.current.value = "";
  }

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  if(!roomId) {
    return (
      <div />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.messageList}>
        {messages.map(({message, username, time}, index) => {
          return (
            <div className={styles.message} key={index}> 
              <div className={styles.messageInner}>
                <span className={styles.messageSender}>{username} - {time}</span>
                <span className={styles.messageBody}>{message}</span>
              </div>
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      <div className={styles.messageBox}>
        <textarea rows={1} ref={messageRef} placeholder="Type your message here" />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default MessagesContainer;
