import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BreakingNews } from "../models/breakingNews.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { mongoose } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

//post breaking news
const postBreakingNews = asyncHandler(async (req, res) => {
  try {
    const { breakingNewsTitle, breakingNewsContent } = req.body;

    if (!breakingNewsTitle || !breakingNewsContent) {
      throw new ApiError(400, "Breaking news title and conent are required");
    }

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.breakingNewsImage) &&
      req.files.breakingNewsImage.length > 0
    ) {
      coverImageLocalPath = req.files.breakingNewsImage[0].path;
    }

    //upload to cloudinary
    const breakingNewsImageUrl = await uploadOnCloudinary(coverImageLocalPath);

    const slug = breakingNewsTitle.toLowerCase().split(" ").join("-");

    const breakingNews = await BreakingNews.create({
      breakingNewsTitle,
      breakingNewsContent,
      breakingNewsImage: breakingNewsImageUrl?.secure_url || "",
      author_name: req.user.fullName,
      author_email: req.user.email,
      slug,
    });

    const createdbreakingNews = await BreakingNews.findById(breakingNews._id);

    if (!createdbreakingNews) {
      throw new ApiError(
        500,
        "Something went wrong while posting breaking news"
      );
    }

    const slugUpdatedBreakingNews = await BreakingNews.findByIdAndUpdate(
      createdbreakingNews._id,
      {
        $set: {
          slug: slug + "-" + createdbreakingNews._id,
        },
      },
      { new: true }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          slugUpdatedBreakingNews,
          "Breaking news posted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while posting breaking news");
  }
});

//edit breaking news
const updateBreakingNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const { breakingNewsTitle, breakingNewsContent } = req.body;

    if (!breakingNewsTitle || !breakingNewsContent) {
      throw new ApiError(400, "All fields are required");
    }

    const breakingNews = await BreakingNews.findByIdAndUpdate(
      id,
      {
        $set: {
          breakingNewsTitle,
          breakingNewsContent,
        },
      },
      { new: true }
    );

    if (!breakingNews) {
      throw new ApiError(404, "No Breaking News was found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, breakingNews, "Breaking News updated successfully")
      );
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid Breaking News ID");
    }
    throw new ApiError(404, "No Breaking News was found");
  }
});

//get all breaking news
const getAllBreakingNews = asyncHandler(async (req, res) => {
  try {
    const breakingNews = await BreakingNews.find({})
      .sort({ createdAt: -1 })
      .select("-updatedAt -author_email -__v");

    if (!breakingNews) {
      throw new ApiError(404, "No Breaking News found");
    }

    //count documents
    const totalBreakingNews = breakingNews.length;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { breakingNews, totalBreakingNews },
          "Breaking News Fetched Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while fetching the Breaking News"
    );
  }
});

//get single breaking news
const getSingleBreakingNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    //inorder to show slug value
    const searchId = id.split("-");
    const requiredId = searchId[searchId.length - 1];

    const breakingNews = await BreakingNews.findById(requiredId).select(
      "-updatedAt -author_email -__v"
    );
    if (!breakingNews) {
      throw new ApiError(404, "No Breaking News found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,

        breakingNews,
        "Single Breaking News Fetched Successfully"
      )
    );
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid Breaking News ID");
    }
    throw new ApiError(404, "No  Breaking News found");
  }
});

//delete breaking news
const deleteBreakingNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const breakingNews = await BreakingNews.findByIdAndDelete(id).select(
      "-__v -author_email -updatedAt"
    );

    if (!breakingNews) {
      throw new ApiError(404, "No Breaking News found");
    }

    const breakingNewsUrl = breakingNews.breakingNewsImage;

    if (breakingNewsUrl.length > 0) {
      //Delete Image from cloudinary
      const imageUrl = breakingNews.breakingNewsImage.split("/");

      const requiredImageUrl = imageUrl[imageUrl.length - 1].split(".")[0];

      cloudinary.uploader.destroy(requiredImageUrl, (err, result) => {
        if (err) {
          console.log(`Error Occured during deleting image from Cloudinary`);
        }
        // console.log(result);
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, breakingNews, "Breaking News deleted successfully")
      );
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid Breaking News ID");
    }
    throw new ApiError(404, "No Breaking News was found");
  }
});

export {
  postBreakingNews,
  updateBreakingNews,
  getAllBreakingNews,
  getSingleBreakingNews,
  deleteBreakingNews,
};
