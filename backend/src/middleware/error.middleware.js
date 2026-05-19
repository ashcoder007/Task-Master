import { Prisma } from "@prisma/client";

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = err.code === "P2002" ? 409 : 400;
    message = err.code === "P2002" ? "A record with this value already exists" : "Database request failed";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
