import express from "express";
import auth from "../middleware/auth.js";
import { isOrgAdmin } from "../middleware/rbac.js";
import { getSettings, updateSettings } from "../controllers/organizationController.js";

const router = express.Router();

router.get("/settings", auth, isOrgAdmin, getSettings);
router.patch("/settings", auth, isOrgAdmin, updateSettings);

export default router;
