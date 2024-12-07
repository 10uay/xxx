import { User } from "../models/user.model.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("isAdmin");

    if (!user || !user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to make this request",
      });
    }
    next();
  } catch (error) {
    console.log("Error in verifyAdmin ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
