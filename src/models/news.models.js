import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: Array,
      required: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

export const News = mongoose.model("News", newsSchema);
