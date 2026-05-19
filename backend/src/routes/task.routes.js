import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { taskSchema, taskUpdateSchema } from "../validations/task.validation.js";

const router = Router();

router.use(protect);
router.get("/", getTasks);
router.post("/", validate(taskSchema), createTask);
router.put("/:id", validate(taskUpdateSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;
