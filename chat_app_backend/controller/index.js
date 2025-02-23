const express = require("express");
const jose = require("jose");
const { User, Conversation } = require("../model/index");
const { z } = require("zod");
// TODO: sync vs async sign jwt

const router = express.Router();

const secret = new TextEncoder().encode(
  "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
);

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {*} next
 */

const handleErrors = (res, error, status = 500) => {
  console.error(error);
  res.status(status).send({ error: error.message || "Internal server error" });
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const { payload } = await jose.jwtVerify(req.headers.authorization, secret);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Unauthorized" });
  }
};

const emailSchema = z.string().email("Invalid email format");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/,
    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
  );
const usernameSchema = z
  .string()
  .min(5, "Username must be at least 5 characters")
  .max(20, "Username must be at most 20 characters");

const userSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = userSchema.pick({ email: true, password: true });

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  time: z.coerce.date(),
  user: objectIdSchema,
  // messageId: objectIdSchema,
});

const conversationSchema = z.object({
  conversationId: objectIdSchema, // The main conversation ObjectId
  users: z
    .array(objectIdSchema)
    .length(2, "Users array must contain exactly 2 users"),
  messages: z.array(messageSchema),
});

router.get("/conversation", auth, async (req, res) => {
  const userId = req.userId;

  try {
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
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/conversation/:conversationId", auth, async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId;

  const validation = conversationSchema
    .pick({ conversationId: true })
    .safeParse({ conversationId });
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate({
      path: "users",
      model: "User",
      select: { _id: 1, username: 1 },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.users.some((user) => user._id.toString() === userId)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to access this conversation" });
    }

    res.send(conversation.messages);
  } catch (error) {
    // res.status(500).json({ error: "Server error" });
    handleErrors(res, error);
  }
});

router.get("/newconversation", auth, async (req, res) => {
  const userId = req.userId; // Get userId from token

  const users = await User.find();

  const conversations = await Conversation.find({ users: userId });

  try {
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
    handleErrors(res, error);
  }
});

router.post("/newconversation/1", auth, async (req, res) => {
  try {
    const userId = req.userId; // Extract userId from token (auth middleware should set this)
    const { userId2 } = req.body; // Extract userId2 from request body

    if (!userId2) {
      return res.status(400).json({ error: "Second user ID is required" });
    }

    const newConversation = new Conversation({
      users: [userId, userId2],
      messages: [],
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    handleErrors(res, error);
  }
});

router.post("/login", async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    const token = await new jose.SignJWT({ username: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("chat_app")
      .setSubject(user._id)
      .sign(secret);
    res.send({ accessToken: token });
  } else {
    // res.status(403).json({ error: "Invalid email or password" });
    handleErrors(res, error);
  }
});

router.post("/conversation/:conversationId/message", auth, async (req, res) => {
  try {
    const message = req.body;

    const validation = messageSchema.safeParse(message);
    if (!validation.success) {
      return res.status(400).send({ errors: validation.error.errors });
    }

    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ error: "Conversation not found" });

    conversation.messages.push(message);
    await conversation.save();
    res.send({});
  } catch (error) {
    handleErrors(res, error);
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
      res.status(500).send({ error: "Server error" });
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
    } catch (err) {
      console.error("Delete message error:", err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

router.put(
  "/conversation/:conversationId/message/:messageId",
  auth,
  async (req, res) => {
    try {
      const newMessageText = req.body.message;
      const { conversationId, messageId } = req.params;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation)
        return res.status(404).send({ error: "Conversation not found" });

      const message = conversation.messages.find(
        (m) => m._id.toString() === messageId
      );
      if (!message) return res.status(404).send({ error: "Message not found" });

      if (!req.body.message)
        return res.status(400).json({ error: "Message content is required" });

      message.message = newMessageText;
      await conversation.save();
      res.send({ message: "Message updated successfully" });
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  }
);

module.exports = router;
