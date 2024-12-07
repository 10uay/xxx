import { Event } from "../models/event.model.js";

// admin user
export const addEvent = async (req, res) => {
  // jwt token ; in req.headers.authorization
  // category, title, content_in_EN, content_in_AR ; in req
  // event, success, message ; in res
  const { category, title, content_in_EN, content_in_AR } = req.body;

  if (!category || !title || !content_in_EN || !content_in_AR) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const titleIsAlradyUsed = await Event.findOne({ title });
  // console.log("titleIsAlradyUsed", titleIsAlradyUsed);

  if (titleIsAlradyUsed) {
    return res
      .status(400)
      .json({ success: false, message: "This title is already used" });
  }

  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  try {
    const event = new Event({
      ...req.body,
      slug,
    });
    await event.save();

    res
      .status(201)
      .json({ success: true, message: "Event added successfully", event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getEvents = async (req, res) => {
  // jwt token ; in req.headers.authorization
  // title, category ; in req.body
  // event, success, message ; in res
  const { title, category } = req.body;


  if (!title && !category) {
    return res
      .status(400)
      .json({ success: false, message: "Title or category is required" });
  }

  const events = await Event.find({ $or: [{ title }, { category }] });
  // console.log("event", event);

  const titleOrCategory = title
    ? `There is no event with title: ${title}`
    : `There are no events in category: ${category}`;

  if (!events) {
    return res.status(400).json({
      success: false,
      message: titleOrCategory,
    });
  }

  try {
    res.status(200).json({ success: true, message: "Events you want", events });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const editEvent = async (req, res) => {
  // eventId ; in req.query
  // jwt token ; in req.headers.authorization
  // new category, new title, new content_in_EN, new content_in_AR ; in req.body
  // event, success, message ; in res
  const { category, title, content_in_EN, content_in_AR } = req.body;

  if (!category || !title || !content_in_EN || !content_in_AR) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  console.log(req.query);

  try {
    const newPost = await Event.findByIdAndUpdate(
      req.query.eventId,
      {
        $set: {
          ...req.body,
          slug,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Event has been updated successfully",
      newPost,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeEvent = async (req, res) => {
  // eventId ; in req.query
  // jwt token ; in req.headers.authorization
  // success, message ; in res
  try {
    await Event.findByIdAndDelete(req.query.eventId);
    res
      .status(200)
      .json({ success: true, message: "The event has been deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// normal user
export const getAllEvents = async (req, res) => {
  // events, success ;in res
  try {
    const events = await Event.find();

    res.status(200).json({
      success: true,
      message: "All events have been fetched",
      events,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
