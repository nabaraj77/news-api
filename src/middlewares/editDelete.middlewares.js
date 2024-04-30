import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

import { ApiError } from "../utils/ApiError.js";

export const userAutorization = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user);
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
