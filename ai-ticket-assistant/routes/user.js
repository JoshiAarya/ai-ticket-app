import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
  me,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authenticate, me);

export default router;
