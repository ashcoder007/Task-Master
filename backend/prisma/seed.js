import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shouldReset = process.env.SEED_RESET === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (shouldReset) {
    if (isProduction && process.env.ALLOW_PRODUCTION_SEED_RESET !== "true") {
      throw new Error("Refusing to reset production data. Set ALLOW_PRODUCTION_SEED_RESET=true only if you intentionally want to delete production rows.");
    }

    await prisma.activity.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  }

  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taskmaster.dev" },
    update: {
      name: "Avery Stone",
      role: "ADMIN",
      avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Avery"
    },
    create: {
      name: "Avery Stone",
      email: "admin@taskmaster.dev",
      password,
      role: "ADMIN",
      avatar: "https://api.dicebear.com/8.x/initials/svg?seed=Avery"
    }
  });

  const members = await Promise.all(
    ["Maya Chen", "Noah Brooks", "Iris Patel"].map((name) =>
      prisma.user.upsert({
        where: { email: `${name.split(" ")[0].toLowerCase()}@taskmaster.dev` },
        update: {
          name,
          role: "MEMBER",
          avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`
        },
        create: {
          name,
          email: `${name.split(" ")[0].toLowerCase()}@taskmaster.dev`,
          password,
          role: "MEMBER",
          avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`
        }
      })
    )
  );

  const existingProject = await prisma.project.findFirst({
    where: { title: "Product Launch Workspace", adminId: admin.id }
  });

  const project = existingProject
    ? await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          description: "Coordinate product, design, and engineering launch work.",
          members: { connect: [admin, ...members].map((user) => ({ id: user.id })) }
        }
      })
    : await prisma.project.create({
        data: {
          title: "Product Launch Workspace",
          description: "Coordinate product, design, and engineering launch work.",
          adminId: admin.id,
          members: { connect: [admin, ...members].map((user) => ({ id: user.id })) }
        }
      });

  const tasks = [
    ["Finalize onboarding flow", "IN_PROGRESS", "HIGH", members[0].id, 5],
    ["QA billing settings", "TODO", "MEDIUM", members[1].id, 9],
    ["Prepare launch analytics", "DONE", "HIGH", members[2].id, -2],
    ["Write release notes", "TODO", "LOW", members[0].id, 12],
    ["Review project permissions", "IN_PROGRESS", "MEDIUM", members[1].id, 3]
  ];

  for (const [title, status, priority, assignedTo, days] of tasks) {
    const existingTask = await prisma.task.findFirst({ where: { title, projectId: project.id } });
    const taskData = {
      title,
      description: `${title} for the launch workspace.`,
      status,
      priority,
      assignedTo,
      projectId: project.id,
      createdBy: admin.id,
      dueDate: new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000)
    };

    const task = existingTask
      ? await prisma.task.update({ where: { id: existingTask.id }, data: taskData })
      : await prisma.task.create({ data: taskData });

    const existingActivity = await prisma.activity.findFirst({
      where: { message: `${admin.name} created task ${title}`, taskId: task.id }
    });

    if (!existingActivity) {
      await prisma.activity.create({
        data: {
          message: `${admin.name} created task ${title}`,
          userId: admin.id,
          projectId: project.id,
          taskId: task.id
        }
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
