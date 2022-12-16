const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

commentSchema.set('timestamps', { createdAt: true, updatedAt: false });

module.exports = mongoose.model("Comment", commentSchema);