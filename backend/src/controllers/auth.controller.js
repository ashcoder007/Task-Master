import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { signToken } from "../utils/token.js";

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ApiError(409, "Email is already registered");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: role || "MEMBER",
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`
    }
  });

  res.status(201).json({ success: true, token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
