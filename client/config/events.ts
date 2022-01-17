const EVENTS = {
  connection: "connection",
  CLIENT: {
    create_room: "create_room",
    send_message: "send_message"
  },
  SERVER: {
    room: "room",
    joined_room: "joined_room",
    room_message: "room_message"
  }
};

export default EVENTS;
