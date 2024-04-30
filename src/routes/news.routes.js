import { Router } from "express";
import {
  postNews,
  getAllNews,
  updateNews,
  getSingleNews,
  deleteNews,
  getNewsCategoryWise,
} from "../controllers/news.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//post breaking news
router
  .route("/postNews")
  .post(verifyJWT, upload.fields([{ name: "image", maxCount: 1 }]), postNews);

//get all news
router.route("/getAllNews").get(getAllNews);

//update news
router.route("/updateNews/:id").patch(verifyJWT, updateNews);

//get single news
router.route("/getSingleNews/:id").get(getSingleNews);

//delete news
router.route("/deleteNews/:id").delete(verifyJWT, deleteNews);

//get news category wisw
router.route("/getNewsCategoryWise/:category").get(getNewsCategoryWise);

export default router;
