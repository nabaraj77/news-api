import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { News } from "../models/news.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { mongoose } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

//post breaking news
const postNews = asyncHandler(async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category || !tags) {
      throw new ApiError(400, "All fields are required");
    }

    //Check for images
    const imageLocalPath = req.files?.image[0]?.path;

    if (!imageLocalPath) {
      throw new ApiError(400, "Image is required");
    }

    //upload to cloudinary
    const newsImage = await uploadOnCloudinary(imageLocalPath);

    if (!newsImage) {
      throw new ApiError(400, "Image is required");
    }
    const slug = title.toLowerCase().split(" ").join("-");

    const news = await News.create({
      title,
      content,
      category,
      image: newsImage.secure_url,
      author_name: req.user.fullName,
      author_email: req.user.email,
      tags: [tags],
      slug,
    });

    const createdNews = await News.findById(news._id);

    if (!createdNews) {
      throw new ApiError(500, "Something went wrong while posting news");
    }
    const slugUpdatedNews = await News.findByIdAndUpdate(
      createdNews._id,
      {
        $set: {
          slug: slug + "-" + createdNews._id,
        },
      },
      { new: true }
    );
    return res
      .status(201)
      .json(new ApiResponse(200, slugUpdatedNews, "News posted successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while posting news");
  }
});

//edit breaking news
const updateNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category || !tags) {
      throw new ApiError(400, "All fields are required");
    }
    console.log(title, content, tags, category);
    const news = await News.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          content,
          category,
          tags,
        },
      },
      { new: true }
    );

    if (!news) {
      throw new ApiError(404, "No News was found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, news, "News updated successfully"));
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid News ID");
    }
    throw new ApiError(404, "No News was found");
  }
});

//get all breaking news
const getAllNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.find({})
      .sort({ createdAt: -1 })
      .select("-updatedAt -author_email -__v");

    if (!news) {
      throw new ApiError(404, "No News found");
    }

    //count documents
    const totalNews = news.length;

    return res
      .status(200)
      .json(
        new ApiResponse(200, { news, totalNews }, "News Fetched Successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching the News");
  }
});

//get single breaking news
const getSingleNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    //inorder to show slug value
    const searchId = id.split("-");
    const requiredId = searchId[searchId.length - 1];

    const news = await News.findById(requiredId).select(
      "-updatedAt -author_email -__v"
    );
    if (!news) {
      throw new ApiError(404, "No News found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,

        news,
        "Single News Fetched Successfully"
      )
    );
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid News ID");
    }
    throw new ApiError(404, "No News found");
  }
});

//delete breaking news
const deleteNews = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.findByIdAndDelete(id).select(
      "-__v -author_email -updatedAt"
    );

    if (!news) {
      throw new ApiError(404, "No News found");
    }

    const newsUrl = news.image;

    if (newsUrl.length > 0) {
      //Delete Image from cloudinary
      const imageUrl = newsUrl.split("/");
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
      .json(new ApiResponse(200, news, "News deleted successfully"));
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid News ID");
    }
    throw new ApiError(404, "No News was found");
  }
});

//get news on the basis of aggregation
const getNewsCategoryWise = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category;

    //for pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const categoryList = ["sports", "finance", "politics"];

    if (!categoryList.includes(category)) {
      throw new ApiError(404, "No category of news exists");
    }

    const news = await News.aggregate([
      {
        $match: {
          category: category,
        },
      },
      {
        $project: {
          title: 1,
          image: 1,
          author_name: 1,
          content: 1,
          slug: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    //count documents
    const totalNews = news.length;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { news, totalNews },
          "News Fetched Successfully On the basis of Category"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(400, "No such category of news exists");
    }
    throw new ApiError(
      500,
      "Something went wrong while fetching the News On the basis of Category"
    );
  }
});

export {
  postNews,
  getAllNews,
  updateNews,
  getSingleNews,
  deleteNews,
  getNewsCategoryWise,
};
