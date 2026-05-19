import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activity.service.js";

const includeProject = {
  admin: { select: { id: true, name: true, email: true, avatar: true } },
  members: { select: { id: true, name: true, email: true, avatar: true, role: true } },
  tasks: {
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } }
    }
  },
  activities: {
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { id: true, name: true, avatar: true } } }
  }
};

export const getProjects = asyncHandler(async (req, res) => {
  const where = req.user.role === "ADMIN" ? { adminId: req.user.id } : { members: { some: { id: req.user.id } } };
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: includeProject
  });
  res.json({ success: true, data: projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.create({
    data: {
      ...req.validated.body,
      adminId: req.user.id,
      members: { connect: { id: req.user.id } }
    },
    include: includeProject
  });
  await logActivity({ message: `${req.user.name} created project ${project.title}`, userId: req.user.id, projectId: project.id });
  res.status(201).json({ success: true, data: project });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      OR: [{ adminId: req.user.id }, { members: { some: { id: req.user.id } } }]
    },
    include: includeProject
  });
  if (!project) throw new ApiError(404, "Project not found");
  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, adminId: req.user.id } });
  if (!project) throw new ApiError(404, "Project not found");

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: req.validated.body,
    include: includeProject
  });
  await logActivity({ message: `${req.user.name} updated project ${updated.title}`, userId: req.user.id, projectId: updated.id });
  res.json({ success: true, data: updated });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, adminId: req.user.id } });
  if (!project) throw new ApiError(404, "Project not found");
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, adminId: req.user.id } });
  if (!project) throw new ApiError(404, "Project not found");

  const member = await prisma.user.findUnique({ where: { email: req.validated.body.email } });
  if (!member) throw new ApiError(404, "User not found");

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { members: { connect: { id: member.id } } },
    include: includeProject
  });
  await logActivity({ message: `${member.name} joined project ${updated.title}`, userId: member.id, projectId: updated.id });
  res.json({ success: true, data: updated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, adminId: req.user.id } });
  if (!project) throw new ApiError(404, "Project not found");
  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { members: { disconnect: { id: req.params.userId } } },
    include: includeProject
  });
  res.json({ success: true, data: updated });
});
