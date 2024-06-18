const PostModel = require('../models/postModel.js');

const addLog = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    const post = await newPost.save();
    // console.log("Post ended");
    if (!post) {
      console.log("Can't post");
      return res.status(400).json({ message: "Failed to create post" });
    }
    res.status(200).json("Post Uploaded");
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllLogs = async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteAllLogs = async (req, res) => {
  try {
    await PostModel.deleteMany();
    res.status(200).json({ message: "All posts deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  addLog,
  getAllLogs,
  deleteAllLogs,
};
