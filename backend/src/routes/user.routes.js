import { Router } from "express";
import { deleteUser, getUsers } from "../controllers/user.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("ADMIN"));
router.get("/", getUsers);
router.delete("/:id", deleteUser);

export default router;
