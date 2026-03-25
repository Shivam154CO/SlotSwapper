import express from "express";
import auth from "../middleware/auth.js";
import { isOrgAdmin, isManager } from "../middleware/rbac.js";
import { sendInvite, getInvites, revokeInvite } from "../controllers/inviteController.js";

const router = express.Router();

// Only Org Admins or Managers can manage invites
router.post("/", auth, isManager, sendInvite);
router.get("/", auth, isManager, getInvites);
router.delete("/:id", auth, isOrgAdmin, revokeInvite);

export default router;
