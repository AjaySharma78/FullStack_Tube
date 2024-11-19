import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../env/config.js";
const userSchema = new Schema(
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
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId;
      },
    },
    refreshToken: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
      default: null,
    },
    verifyTokenExpires: {
      type: Date,
      default: null,
    },
    forgotPasswordToken: {
      type: String,
      default: null,
    },
    forgotPasswordTokenExpires: {
      type: Date,
      default: null,
    },
    lastUsernameChange: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // if password is not modified, skip this middleware
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // this.password is the hashed password from the database and password is the password from the user
  const correctPassword = await bcrypt.compare(password, this.password);
  if (!correctPassword) return false;
  return correctPassword;
};

userSchema.methods.generateAccessToken = function () {
  // id is payload name and this._id is the value from the database
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      fullName: this.fullName,
    },
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpiresIn }
  );
};

userSchema.methods.generateRefreshToken = function () {
  // id is payload name and this._id is the value from the database
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
    },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );
};

userSchema.methods.generateEmailToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
    },
    config.emailTokenSecret
  );
};

export const User = mongoose.model("User", userSchema);
