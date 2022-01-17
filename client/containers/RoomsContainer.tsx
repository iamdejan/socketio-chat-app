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

  function handleJoinRoom(key: string) {
    if(key === roomId) {
      return;
    }

    socket.emit(EVENTS.CLIENT.join_room, key);
  }

  return (
    <nav>
      <div>
        <input ref={newRoomRef} placeholder="Room name" />
        <button onClick={handleCreateRoom}>CREATE ROOM</button>
      </div>

      {Object.keys(rooms).map((key) => {
        return (
          <div key={key}>
            <button disabled={key === roomId} title={`Join ${rooms[key].name}`} onClick={(event) => {
              event.preventDefault();
              handleJoinRoom(key);
            }}>
              {rooms[key].name}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
  
export default RoomsContainer;
  