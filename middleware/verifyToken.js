import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    const user = await User.findOne({ _id: decoded.userId }).select(
      "isVerified"
    );

    if (!user || !user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "You should verify your account first",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
