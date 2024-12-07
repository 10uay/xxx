import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to Mongo_DB"))
    .catch((error) => console.log("Mongo_DB connection error:", error));
};
