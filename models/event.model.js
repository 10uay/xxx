import mongoose from "mongoose";
  // image, category, title, content_in_EN, content_in_AR

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    content_in_EN: {
      type: String,
      required: true,
    },
    content_in_AR: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://mailsend-email-assets.mailtrap.io/yhdnezt5w2u393a1s4jhsg9oc0t9.png",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
