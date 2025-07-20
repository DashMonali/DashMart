import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
} from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/profile", auth, getProfile);

export default userRouter;
