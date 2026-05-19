import { Router } from "express";
import { createComment, getComments } from "../controllers/comment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { commentSchema } from "../validations/comment.validation.js";

const router = Router();

router.use(protect);
router.post("/", validate(commentSchema), createComment);
router.get("/:taskId", getComments);

export default router;
