import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utlis/generateToken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  // sendWelcomeEmail,
} from "../mailer/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, mobile, username, id_card } = req.body;

  try {
    if (!password || !username || !id_card) {
      throw new Error("All fields are required");
    }
    if ((!mobile && !email) || (mobile && email)) {
      throw new Error("Please fill out one of both email and mobile");
    }

    const userAlreadyExists = await User.findOne({
      $or: [...(mobile ? [{ mobile }] : []), ...(email ? [{ email }] : [])],
    });

    // console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      username,
      email: email || null,
      mobile: mobile || null,
      password: hashedPassword,
      id_card,
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    await user.save();

    // jwt
    // const token = generateToken(res, user._id);

    if (user.email) {
      await sendVerificationEmail(user.email, verificationCode);
      res.status(201).json({
        success: true,
        message:
          "User created successfully and Verification code has just sent to your email",
        user: {
          ...user._doc,
          password: undefined,
        },
        // token,
      });
    } else {
      // send SMS
      const message = `Hello,\n We have just sent your verification code,
      please copy the following code and paste it into the app.\n ${verificationCode}`;
      axios
        .post("https://api.yourtelecomprovider.com/send-sms", {
          to: user.mobile,
          message: message,
          apiKey: process.env.APIKEY,
        })
        .then(() =>
          res.status(201).json({
            success: true,
            message:
              "User created successfully and Verification code has been sent successfully",
            user: {
              ...user._doc,
              password: undefined,
            },
            // token,
          })
        )
        .catch(() =>
          res.status(500).json({
            success: false,
            message:
              "User created successfully but Failed to send verification code",
            user: {
              ...user._doc,
              password: undefined,
            },
          })
        );
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code, email, mobile } = req.body;

  if ((!mobile && !email) || (mobile && email)) {
    throw new Error("Please fill out one of both email and mobile");
  }

  try {
    const user = await User.findOne({
      $or: [...(mobile ? [{ mobile }] : []), ...(email ? [{ email }] : [])],
      verificationCode: code,
      verificationCodeExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    // const contact = user.email ? user.email : user.mobile;
    // await sendWelcomeEmail(contact, user.username);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, mobile, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [...(mobile ? [{ mobile }] : []), ...(email ? [{ email }] : [])],
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your account first to proceed",
      });
    }

    const token = generateToken(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
      token,
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  // res.clearCookie("token");
  const token = "";
  res
    .status(200)
    .json({ success: true, message: "Logged out successfully", token });
};

export const forgotPassword = async (req, res) => {
  const { email, mobile } = req.body;
  try {
    const user = await User.findOne({
      $or: [...(mobile ? [{ mobile }] : []), ...(email ? [{ email }] : [])],
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset code
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    if (user.email) {
      await sendPasswordResetEmail(user.email, resetToken);
      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } else {
      // send SMS
      const message = `Hello,\n To reset your password, please copy the following token and paste it into the app.\n ${resetToken}`;
      axios
        .post("https://api.yourtelecomprovider.com/send-sms", {
          to: user.mobile,
          message: message,
          apiKey: process.env.APIKEY,
        })
        .then(() =>
          res.status(200).json({
            success: true,
            message: "Password reset token has been sent successfully",
          })
        )
        .catch(() =>
          res.status(500).json({
            success: false,
            message: "Failed to send password reset token",
          })
        );
    }
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, passwordToken } = req.body; // this token from email/SMS, and it is not jwt token

    const user = await User.findOne({
      resetPasswordToken: passwordToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resendCode = async (req, res) => {
  const { email, mobile } = req.body;

  try {
    const user = await User.findOne({
      $or: [...(mobile ? [{ mobile }] : []), ...(email ? [{ email }] : [])],
    });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = verificationCode;
    (user.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000), // 15 minutes
      await user.save();

    if (user.email) {
      await sendPasswordResetEmail(user.email, verificationCode);
      res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
      });
    } else {
      // send SMS
      const message = `Hello,\n We have just sent verification code,
      please copy the following code and paste it into the app.\n ${verificationCode}`;
      axios
        .post("https://api.yourtelecomprovider.com/send-sms", {
          to: user.mobile,
          message: message,
          apiKey: process.env.APIKEY,
        })
        .then(() =>
          res.status(200).json({
            success: true,
            message: "Verification code has been sent successfully",
          })
        )
        .catch(() =>
          res.status(500).json({
            success: false,
            message: "Failed to send verification code",
          })
        );
    }
  } catch (error) {
    console.log("Error in resend verification code ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
