import { prisma } from "../config/prisma.js";

export const logActivity = ({ message, userId, projectId, taskId }) =>
  prisma.activity.create({ data: { message, userId, projectId, taskId } });
