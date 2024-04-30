import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

//Generating Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //set refresh token to database
    user.refreshToken = refreshToken;
    //Save refresh token to databse
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
  try {
    const {
      userName,
      email,
      fullName,
      password,
      role,
      mobileNumber,
      province,
      district,
      municipality,
      tole,
      wardNo,
    } = req.body;
    if (
      !userName ||
      !email ||
      !fullName ||
      !password ||
      !role ||
      !mobileNumber ||
      !province ||
      !district ||
      !municipality ||
      !tole ||
      !wardNo
    ) {
      throw new ApiError(400, "All fields are required");
    }

    //Check if the userName or Email already exists
    const existedUser = await User.findOne({
      $or: [{ email }, { userName }, { mobileNumber }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        "User with username or email or mobile number already exists"
      );
    }
    //Send to database
    const user = await User.create({
      fullName,
      email,
      password,
      mobileNumber,
      role,
      location: {
        province,
        district,
        municipality,
        tole,
        wardNo,
      },

      userName: userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password ");
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    //Send response
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User Created Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user",
      error
    );
  }
});

//get single user
const getSingleUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select("-password -refreshToken -__v");
    if (!user) {
      throw new ApiError(404, "No user found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Single User Fetched Successfully"));
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid User ID");
    }
    throw new ApiError(404, "No  User found");
  }
});

//update project

const verifyUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const { isActive } = req.body;

    if (!isActive) {
      throw new ApiError(400, "Is Active field required");
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: isActive,
        },
      },
      { new: true }
    ).select("-password -refreshToken -__v");

    if (!user) {
      throw new ApiError(404, "No User was found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, user, "User Is Active status updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while verifying the user");
  }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      throw new ApiError(409, "Username or Email is required");
    }

    const findUser = await User.findOne({
      $or: [{ email: userName }, { userName: userName }],
    });

    if (!findUser) {
      throw new ApiError(404, "User does not exists");
    }

    //check for password
    const isPasswordValid = await findUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid User Credentials");
    }
    const loggedInUser = await User.findById(findUser._id).select(
      "-password -createdAt -updatedAt -__v -refreshToken"
    );

    if (loggedInUser.isActive === false) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "User is not activated. Please contact your admin"
          )
        );
    }

    //else send access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      findUser._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while logging the user",
      error
    );
  }
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: null,
        },
      },
      {
        //gives latest updated value from database
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while logging out the user");
  }
});

//Change Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  getSingleUser,
  logoutUser,
  changeCurrentPassword,
  verifyUser,
};
