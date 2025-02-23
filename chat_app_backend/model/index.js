const { Schema, ObjectId, model } = require("mongoose");

const UserSchema = new Schema({
  id: ObjectId,
  username: String,
  email: String,
  password: String,
});

const User = model("User", UserSchema);

const ConversationSchema = new Schema({
  id: ObjectId,
  users: [{ type: ObjectId, ref: "User" }],
  messages: [
    {
      message: String,
      time: Date,
      user: { type: ObjectId, ref: "User", select: { username: 1 } },
      id: ObjectId,
    },
  ],
});

const Conversation = model("Conversation", ConversationSchema);

module.exports = { User: User, Conversation: Conversation };
