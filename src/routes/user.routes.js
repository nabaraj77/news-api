import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getSingleUser,
  verifyUser,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//register user
router.route("/register").post(registerUser);

//get single user
router.route("/getSingleUser/:id").get(getSingleUser);

//verifyUser
router.route("/verifyUser/:id").post(verifyUser);

//login user
router.route("/login").post(loginUser);

//logout user
router.route("/logout").post(verifyJWT, logoutUser);

//change Password
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);

export default router;
