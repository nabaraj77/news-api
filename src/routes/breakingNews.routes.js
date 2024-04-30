import { Router } from "express";
import {
  deleteBreakingNews,
  getAllBreakingNews,
  getSingleBreakingNews,
  postBreakingNews,
  updateBreakingNews,
} from "../controllers/breakingNews.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//post breaking news
router
  .route("/postBreakingNews")
  .post(
    upload.fields([{ name: "breakingNewsImage", maxCount: 1 }]),
    verifyJWT,
    postBreakingNews
  );

//update breaking news
router.route("/updateBreakingNews/:id").patch(verifyJWT, updateBreakingNews);

//get all breaking news
router.route("/getAllBreakingNews").get(getAllBreakingNews);

//get single breaking news
router.route("/getSingleBreakingNews/:id").get(getSingleBreakingNews);

//delete breaking news
router.route("/deleteBreakingNews/:id").delete(deleteBreakingNews);

export default router;
