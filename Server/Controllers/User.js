import Blog from "../Models/Blog.js";
import User from "../Models/User.js";
import Category from "../Models/Category.js";
import Comment from "../Models/Comment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exists", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", status: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", status: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found", status: false });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Invalid credentials", status: false });
    const payload = { userId: user._id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.status(200).json({
      message: "Login successful",
      status: true,
      token,
      user: payload,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", status: false });
  }
};


export const getUserBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required", status: false });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }
    const blogs = await Blog.find({ author: userId })
      .populate("author", "name email")
      .populate("category", "name")
      .populate("comments");
    res.status(200).json({ message: "User blogs fetched successfully", status: true, blogs });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};