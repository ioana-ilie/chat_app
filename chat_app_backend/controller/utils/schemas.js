const { z } = require("zod");

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

const messageTextSchema = z.string().min(1, "Message cannot be empty").max(200, "Maximum of 200 characters")

const conversationSchema = z.object({
  conversationId: objectIdSchema, 
  users: z
    .array(objectIdSchema)
    .length(2, "Users array must contain exactly 2 users"),
  messages: z.array(messageTextSchema),
});

module.exports = {
  emailSchema,
  passwordSchema,
  usernameSchema,
  userSchema,
  loginSchema,
  objectIdSchema,
  messageTextSchema,
  conversationSchema,
};
