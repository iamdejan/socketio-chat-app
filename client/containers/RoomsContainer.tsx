import { SyntheticEvent, useRef } from "react";
import EVENTS from "../config/events";
import { useSocket } from "../context/socket.context";

function RoomsContainer(): JSX.Element {

  const {socket, roomId, rooms} = useSocket();
  const newRoomRef = useRef<HTMLInputElement>(null);

  function handleCreateRoom(e: SyntheticEvent) {
    e.preventDefault();

    const roomName = newRoomRef.current?.value || "";
    if(roomName === "") {
      return;
    }

    socket.emit(EVENTS.CLIENT.create_room, {roomName});

    const inputElement = newRoomRef.current;
    if(inputElement === null || inputElement === undefined) {
      return;
    }
    inputElement.value = "";
  }

  return (
    <nav>
      <div>
        <input ref={newRoomRef} placeholder="Room name" />
        <button onClick={handleCreateRoom}>CREATE ROOM</button>
      </div>

      {Object.keys(rooms).map((key) => {
        return (
          <div key={key}>{key}</div>
        );
      })}
    </nav>
  );
}
  
export default RoomsContainer;
  