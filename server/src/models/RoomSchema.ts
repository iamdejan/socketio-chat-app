import mongoose from "mongoose";
import MessageDetail from "../types/MessageDetail";
import Room from "../types/Room";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  messages: {
    type: [],
    required: true
  }
});

interface RoomDoc extends mongoose.Document {
  roomId: string;
  name: string;
  messages: MessageDetail[];
}

roomSchema.statics.build = (attr: Room) => {
  return new RoomSchema(attr);
};

interface RoomSchemaInterface extends mongoose.Model<RoomDoc> {
  build(attr: Room): RoomDoc
}

const RoomSchema = mongoose.model<RoomDoc, RoomSchemaInterface>("RoomSchema", roomSchema);

export default RoomSchema;
