import React, { useRef } from "react";
import EVENTS from "../config/events";
import { useSocket } from "../context/socket.context";

function MessagesContainer(): JSX.Element {

  const {socket, roomId, username, messages, setMessages} = useSocket();
  const messageRef = useRef<HTMLTextAreaElement>(null);

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

  if(!roomId) {
    return (
      <div />
    );
  }

  return (
    <div>
      {messages.map((message, index) => {
        return <p key={index}><b>{message.username}</b>: {message.message}</p>
      })}

      <div>
        <textarea rows={1} ref={messageRef} placeholder="Type your message here" />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default MessagesContainer;
