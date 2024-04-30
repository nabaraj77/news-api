import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonWebToken from "jsonwebtoken";

const locationSchema = new mongoose.Schema({
  province: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  municipality: {
    type: String,
    required: true,
    trim: true,
  },
  tole: {
    type: String,
    required: true,
    trim: true,
  },
  wardNo: {
    type: Number,
    required: true,
    trim: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    location: locationSchema,

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
//Encrypting password before saving using pre hook of mongoose middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Checking the password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Generating Tokens
userSchema.methods.generateAccessToken = function () {
  return jsonWebToken.sign(
    {
      _id: this._id,
      // email: this.email,
      // username: this.username,
      // fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jsonWebToken.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
