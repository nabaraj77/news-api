import mongoose from "mongoose";

const breakingNewsSchema = new mongoose.Schema(
  {
    breakingNewsTitle: {
      type: String,
      required: true,
      trim: true,
    },
    breakingNewsContent: {
      type: String,
      required: true,
      trim: true,
    },
    breakingNewsImage: {
      type: String,
    },
    author_name: {
      type: String,
    },
    author_email: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BreakingNews = mongoose.model("BreakingNews", breakingNewsSchema);
