import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
  _count: {
    select: {
      assignedTasks: true,
      projects: true
    }
  }
};

export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: userSelect
  });

  res.json({ success: true, data: users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, "You cannot remove your own admin account");
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "User removed" });
});
