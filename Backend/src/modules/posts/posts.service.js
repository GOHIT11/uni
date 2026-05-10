const Post = require('./posts.model');
const Comment = require('./comments.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

const createPost = async (userId, data) => {
  const post = await Post.create({ ...data, author: userId });
  return post;
};

const getFeed = async (filters = {}) => {
  const { page, limit, skip } = parsePagination(filters);
  const query = {};
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters._id) {
    query._id = filters._id;
  }

  const [items, totalCount] = await Promise.all([
    Post.find(query)
      .populate('author', 'fullName avatar email department role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query),
  ]);

  return { items, pagination: buildPaginationResult(page, limit, totalCount) };
};

const votePost = async (postId, userId, action) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  const upvoteIndex = post.upvotes.indexOf(userId);
  const downvoteIndex = post.downvotes.indexOf(userId);

  if (action === 'upvote') {
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(userId);
      if (downvoteIndex > -1) post.downvotes.splice(downvoteIndex, 1);
    }
  } else if (action === 'downvote') {
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(userId);
      if (upvoteIndex > -1) post.upvotes.splice(upvoteIndex, 1);
    }
  }

  await post.save();
  return post;
};

const savePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  const index = post.savedBy.indexOf(userId);
  if (index > -1) {
    post.savedBy.splice(index, 1);
  } else {
    post.savedBy.push(userId);
  }

  await post.save();
  return post;
};

const addComment = async (postId, userId, content, parentCommentId = null) => {
  const comment = await Comment.create({
    post: postId,
    author: userId,
    content,
    parentComment: parentCommentId,
  });

  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
  return comment;
};

const getComments = async (postId) => {
  const comments = await Comment.find({ post: postId })
    .populate('author', 'fullName avatar email')
    .sort({ createdAt: -1 });

  // Basic tree building
  const commentMap = {};
  const roots = [];

  comments.forEach(c => {
    const doc = c.toObject();
    doc.replies = [];
    commentMap[doc._id] = doc;
  });

  comments.forEach(c => {
    const doc = commentMap[c._id];
    if (doc.parentComment) {
      if (commentMap[doc.parentComment]) {
        commentMap[doc.parentComment].replies.push(doc);
      }
    } else {
      roots.push(doc);
    }
  });

  return roots;
};

module.exports = {
  createPost,
  getFeed,
  votePost,
  savePost,
  addComment,
  getComments,
};
