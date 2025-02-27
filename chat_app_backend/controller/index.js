const express = require("express");
const auth = require("./utils/middlewares");
const {
  generateGuestUsername,
  handleServerErrors,
  handleValidationErrors,
  generateToken,
} = require("./utils/utils");
const {
  conversationSchema,
  userSchema,
  loginSchema,
  messageTextSchema,
} = require("./utils/schemas");
const { Conversation, User } = require("../entity");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationErrors(res, validation);
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email is already registered" });
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationErrors(res, validation);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).send({ error: "Invalid credentials" });

    const token = await generateToken(user._id, user.username);
    res.send({ accessToken: token });
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.get("/conversation", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find(
      { users: userId },
      { messages: { $slice: -1 } } // Get only the last message
    )
      .populate({
        path: "users",
        model: "User",
        select: { _id: 1, username: 1 },
      })
      .populate({
        path: "messages",
        populate: {
          path: "user",
          model: "User",
          select: { _id: 1, username: 1 },
        },
      });

    res.send(conversations);
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.get("/conversation/:conversationId", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const validation = conversationSchema
      .pick({ conversationId: true })
      .safeParse({ conversationId });
    if (!validation.success) {
      return handleValidationErrors(res, validation);
    }

    const conversation = await Conversation.findById(conversationId).populate({
      path: "users",
      model: "User",
      select: { _id: 1, username: 1 },
    });

    if (!conversation) {
      return res.status(404).send({ error: "Conversation not found" });
    }

    if (!conversation.users.some((user) => user._id.toString() === userId)) {
      return res.status(403).send({
        error: "You are not authorized to access this conversation",
      });
    }

    res.send(conversation.messages);
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.get("/new-conversation", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const users = await User.find();
    const conversations = await Conversation.find({ users: userId });

    const availableUsers = users.filter((user) => {
      const isUserInConversationWithLoggedIn = conversations.some(
        (conversation) =>
          conversation.users.includes(user._id) &&
          conversation.users.includes(userId)
      );
      return (
        !isUserInConversationWithLoggedIn && user._id.toString() !== userId
      );
    });

    res.send(availableUsers);
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.post("/new-conversation/1", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { userId2 } = req.body;

    if (!userId2) {
      return res.status(400).send({ error: "Second user ID is required" });
    }

    const newConversation = new Conversation({
      users: [userId, userId2],
      messages: [],
    });

    await newConversation.save();
    res.status(201).send(newConversation);
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.post("/conversation/:conversationId/message", auth, async (req, res) => {
  try {
    const message = req.body;
    const userId = req.userId;

    const validation = messageTextSchema.safeParse(message.message);
    if (!validation.success) {
      return handleValidationErrors(res, validation);
    }

    const conversationId = req.params.conversationId;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).send({ error: "Conversation not found" });

    conversation.messages.push({ message: message.message, user: userId });
    await conversation.save();
    res.send({});
  } catch (error) {
    handleServerErrors(res, error);
  }
});

router.get(
  "/conversation/:conversationId/message/:messageId",
  auth,
  async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;
      const conversation = await Conversation.findById(conversationId);

      if (!conversation)
        return res.status(404).send({ error: "Conversation not found" });

      const messageObj = conversation.messages.find(
        (message) => message._id.toString() === messageId
      );
      if (!messageObj)
        return res.status(404).send({ error: "Message not found" });

      res.send({ message: messageObj.message });
    } catch (error) {
      handleServerErrors(res, error);
    }
  }
);

router.delete(
  "/conversation/:conversationId/message/:messageId",
  auth,
  async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).send({ error: "Conversation not found" });
      }

      const messageIndex = conversation.messages.findIndex(
        (message) => message._id.toString() === messageId
      );

      if (messageIndex === -1) {
        return res.status(404).send({ error: "Message not found" });
      }

      conversation.messages.splice(messageIndex, 1);
      await conversation.save();
      res.send({ messageId: messageId });
    } catch (error) {
      handleServerErrors(res, error);
    }
  }
);

router.put(
  "/conversation/:conversationId/message/:messageId",
  auth,
  async (req, res) => {
    try {
      const newMessageText = req.body.message;

      const validation = messageTextSchema.safeParse(newMessageText);
      if (!validation.success) {
        return handleValidationErrors(res, validation);
      }

      const { conversationId, messageId } = req.params;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation)
        return res.status(404).send({ error: "Conversation not found" });

      const message = conversation.messages.find(
        (m) => m._id.toString() === messageId
      );
      if (!message) return res.status(404).send({ error: "Message not found" });

      message.message = newMessageText;
      await conversation.save();
      res.send({ message: "Message updated successfully" });
    } catch (error) {
      handleServerErrors(res, error);
    }
  }
);

router.post("/demo-conversation", async (req, res) => {
  try {
    const username = await generateGuestUsername();
    const email = `${username}@gmail.com`;
    const password = "Guest123!";

    const guestUser = new User({ username, email, password });
    await guestUser.save();

    const token = await generateToken(guestUser._id, username);

    const existingUsers = await User.find().limit(2);
    if (existingUsers.length < 2) {
      return res.status(500).send({
        error: "Not enough existing users to create demo conversations",
      });
    }

    const [user1, user2] = existingUsers;

    const conversation1 = new Conversation({
      users: [guestUser._id, user1._id],
      messages: Array.from({ length: 5 }, (_, i) => ({
        message: `Message ${i + 1}`,
        time: new Date(),
        user: user1._id,
      })),
    });

    const conversation2 = new Conversation({
      users: [guestUser._id, user2._id],
      messages: Array.from({ length: 5 }, (_, i) => ({
        message: `Message ${i + 1}`,
        time: new Date(),
        user: user2._id,
      })),
    });

    await conversation1.save();
    await conversation2.save();

    setTimeout(async () => {
      await User.findByIdAndDelete(guestUser._id);
      await Conversation.deleteMany({ users: guestUser._id });
    }, 12 * 60 * 60 * 1000);

    res.status(201).send({
      message: "Demo conversation created",
      accessToken: token,
      username,
      email,
      password,
      userId: guestUser._id.toString(),
    });
  } catch (error) {
    handleServerErrors(res, error);
  }
});

module.exports = router;
