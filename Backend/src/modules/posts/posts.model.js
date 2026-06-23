const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['resource', 'event', 'doubt', 'marketplace', 'opportunity', 'discussion', 'general'],
      default: 'general',
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    upvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    downvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
      default: [],
    },
    savedBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
