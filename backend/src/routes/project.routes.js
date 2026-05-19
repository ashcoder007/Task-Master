import { Router } from "express";
import { addMember, createProject, deleteProject, getProject, getProjects, removeMember, updateProject } from "../controllers/project.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { memberSchema, projectSchema } from "../validations/project.validation.js";

const router = Router();

router.use(protect);
router.get("/", getProjects);
router.post("/", authorize("ADMIN"), validate(projectSchema), createProject);
router.get("/:id", getProject);
router.put("/:id", authorize("ADMIN"), validate(projectSchema), updateProject);
router.delete("/:id", authorize("ADMIN"), deleteProject);
router.post("/:id/members", authorize("ADMIN"), validate(memberSchema), addMember);
router.delete("/:id/members/:userId", authorize("ADMIN"), removeMember);

export default router;
