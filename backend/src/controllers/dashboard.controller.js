import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const countBy = (items, key) =>
  items.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] || 0) + 1 }), {});

export const getStats = asyncHandler(async (req, res) => {
  const projectWhere = req.user.role === "ADMIN" ? { adminId: req.user.id } : { members: { some: { id: req.user.id } } };
  const taskWhere = req.user.role === "ADMIN" ? { project: { adminId: req.user.id } } : { assignedTo: req.user.id };

  const [projects, users, tasks] = await Promise.all([
    prisma.project.findMany({ where: projectWhere, include: { members: true } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true } }),
    prisma.task.findMany({ where: taskWhere, include: { assignee: true, project: true } })
  ]);
  const projectIds = projects.map((project) => project.id);
  const activities = await prisma.activity.findMany({
    where: { OR: [{ projectId: { in: projectIds } }, { userId: req.user.id }] },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { user: { select: { id: true, name: true, avatar: true } } }
  });

  const now = new Date();
  const completedByUser = tasks
    .filter((task) => task.status === "DONE" && task.assignee)
    .reduce((acc, task) => ({ ...acc, [task.assignee.name]: (acc[task.assignee.name] || 0) + 1 }), {});

  res.json({
    success: true,
    data: {
      totals: {
        projects: projects.length,
        users: req.user.role === "ADMIN" ? users.length : projects.flatMap((project) => project.members).length,
        tasks: tasks.length,
        overdue: tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== "DONE").length
      },
      status: countBy(tasks, "status"),
      priority: countBy(tasks, "priority"),
      productivity: Object.entries(completedByUser).map(([name, done]) => ({ name, done })),
      upcoming: tasks.filter((task) => task.dueDate && task.status !== "DONE").slice(0, 6),
      activities,
      projects,
      users: req.user.role === "ADMIN" ? users : []
    }
  });
});
