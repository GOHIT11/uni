const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const postsService = require('./posts.service');

const createPost = catchAsync(async (req, res) => {
  const post = await postsService.createPost(req.user.id, req.body);
  sendSuccess(res, post, 'Post created successfully', 201);
});

const getFeed = catchAsync(async (req, res) => {
  const feed = await postsService.getFeed(req.query);
  sendSuccess(res, feed, 'Feed fetched successfully');
});

const votePost = catchAsync(async (req, res) => {
  const post = await postsService.votePost(req.params.id, req.user.id, req.body.action);
  sendSuccess(res, post, `Post ${req.body.action}d successfully`);
});

const savePost = catchAsync(async (req, res) => {
  const post = await postsService.savePost(req.params.id, req.user.id);
  sendSuccess(res, post, 'Post save toggled successfully');
});

const addComment = catchAsync(async (req, res) => {
  const comment = await postsService.addComment(req.params.id, req.user.id, req.body.content, req.body.parentComment);

  const post = await postsService.getFeed({ _id: req.params.id });
  if (post && post.items.length > 0 && post.items[0].author._id.toString() !== req.user.id) {
    const { sendInAppNotification } = require('../../shared/notificationService');
    await sendInAppNotification(post.items[0].author.email, 'post_comment', `${req.user.fullName || req.user.email} commented on your post`, { postId: req.params.id });
  }

  sendSuccess(res, comment, 'Comment added successfully', 201);
});

const getComments = catchAsync(async (req, res) => {
  const comments = await postsService.getComments(req.params.id);
  sendSuccess(res, comments, 'Comments fetched successfully');
});

module.exports = {
  createPost,
  getFeed,
  votePost,
  savePost,
  addComment,
  getComments,
};
