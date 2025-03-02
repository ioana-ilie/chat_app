const { Schema, ObjectId, model } = require("mongoose");

const UserSchema = new Schema({
  id: ObjectId,
  username: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model("User", UserSchema);

const ConversationSchema = new Schema({
  id: ObjectId,
  users: [{ type: ObjectId, ref: "User" }],
  messages: [
    {
      message: String,
      time: { type: Date, default: Date.now},
      user: { type: ObjectId, ref: "User", select: { username: 1 } },
      id: ObjectId,
    },
  ],
});

const Conversation = model("Conversation", ConversationSchema);

module.exports = {
  User: User,
  Conversation: Conversation,
};
