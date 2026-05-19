import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activity.service.js";

export const createComment = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: {
      id: req.validated.body.taskId,
      OR: [{ project: { adminId: req.user.id } }, { project: { members: { some: { id: req.user.id } } } }]
    }
  });
  if (!task) throw new ApiError(404, "Task not found");

  const comment = await prisma.comment.create({
    data: { content: req.validated.body.content, taskId: task.id, userId: req.user.id },
    include: { user: { select: { id: true, name: true, avatar: true } } }
  });
  await logActivity({ message: `${req.user.name} commented on ${task.title}`, userId: req.user.id, projectId: task.projectId, taskId: task.id });
  res.status(201).json({ success: true, data: comment });
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { taskId: req.params.taskId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, avatar: true } } }
  });
  res.json({ success: true, data: comments });
});
