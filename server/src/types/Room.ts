import MessageDetail from "./MessageDetail";

type Room = {
  roomId: string;
  name: string;
  messages: MessageDetail[];
}

export default Room;
