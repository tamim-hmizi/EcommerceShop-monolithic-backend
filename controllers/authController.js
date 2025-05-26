import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import logger from "../config/logger.js";

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  logger.info(`Registering user: ${name} with email: ${email}`);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    await User.create({ name, email, password });
    logger.info(`User ${name} registered successfully`);

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  logger.info(`Attempting login for email: ${email}`);

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    logger.info(`Login successful for ${email}`);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL USERS (Admin)
export const getUsers = async (req, res) => {
  logger.info("Fetching all users");

  try {
    const users = await User.find().sort({ createdAt: -1 });
    logger.info(`Fetched ${users.length} users`);
    res.json({
      success: true,
      message: "Users retrieved",
      data: users,
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE USER BY ID (Admin)
export const getUserById = async (req, res) => {
  const { _id } = req.params;
  logger.info(`Fetching user with ID: ${_id}`);

  try {
    const user = await User.findById(_id);
    if (!user) {
      logger.warn(`User with ID ${_id} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info(`User with ID ${_id} found`);
    res.json({
      success: true,
      message: "User retrieved",
      data: user,
    });
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE USER (Admin)
export const updateUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  const { _id } = req.params;
  logger.info(`Updating user with ID: ${_id}`);

  try {
    const user = await User.findById(_id);
    if (!user) {
      logger.warn(`User with ID ${_id} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = password;
    if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

    const updated = await user.save();
    logger.info(`User with ID ${_id} updated`);

    res.json({
      success: true,
      message: "User updated",
      data: updated,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE USER (Admin)
export const deleteUser = async (req, res) => {
  const { _id } = req.params;
  logger.info(`Deleting user with ID: ${_id}`);

  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      logger.warn(`User with ID ${_id} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info(`User with ID ${_id} deleted`);
    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE USER PROFILE (User)
export const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user._id;
  logger.info(`User updating their own profile: ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    const updatedUser = await user.save();
    logger.info(`User ${userId} updated their profile`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: req.user.token || generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
