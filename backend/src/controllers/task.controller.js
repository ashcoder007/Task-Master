import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activity.service.js";

const includeTask = {
  project: { select: { id: true, title: true } },
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  creator: { select: { id: true, name: true, email: true } },
  comments: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" } }
};

const taskAccessWhere = (user) =>
  user.role === "ADMIN"
    ? { project: { adminId: user.id } }
    : { assignedTo: user.id };

export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, projectId, page = "1", limit = "20", sort = "createdAt", order = "desc" } = req.query;
  const take = Math.min(Number(limit) || 20, 100);
  const skip = ((Number(page) || 1) - 1) * take;
  const sortField = ["createdAt", "dueDate", "priority", "status", "title"].includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = {
    AND: [
      taskAccessWhere(req.user),
      status ? { status } : {},
      priority ? { priority } : {},
      projectId ? { projectId } : {},
      search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}
    ]
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: { [sortField]: sortOrder }, include: includeTask }),
    prisma.task.count({ where })
  ]);

  res.json({ success: true, data: tasks, meta: { total, page: Number(page) || 1, pages: Math.ceil(total / take) } });
});

export const createTask = asyncHandler(async (req, res) => {
  const { dueDate, ...data } = req.validated.body;
  const project = await prisma.project.findFirst({ where: { id: data.projectId, adminId: req.user.id } });
  if (!project) throw new ApiError(403, "Only project admins can create tasks");

  const task = await prisma.task.create({
    data: { ...data, dueDate: dueDate ? new Date(dueDate) : null, createdBy: req.user.id },
    include: includeTask
  });
  await logActivity({ message: `${req.user.name} created task ${task.title}`, userId: req.user.id, projectId: task.projectId, taskId: task.id });
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, ...taskAccessWhere(req.user) } });
  if (!existing) throw new ApiError(404, "Task not found");

  const payload = req.validated.body;
  if (req.user.role === "MEMBER") {
    const keys = Object.keys(payload);
    if (keys.some((key) => key !== "status")) throw new ApiError(403, "Members can update task status only");
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { ...payload, dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate },
    include: includeTask
  });

  if (payload.status && payload.status !== existing.status) {
    await logActivity({ message: `${req.user.name} moved ${task.title} to ${payload.status.replace("_", " ")}`, userId: req.user.id, projectId: task.projectId, taskId: task.id });
  }
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({ where: { id: req.params.id, project: { adminId: req.user.id } } });
  if (!task) throw new ApiError(404, "Task not found");
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Task deleted" });
});
