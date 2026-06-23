const express = require('express');
const postsController = require('./posts.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(postsController.createPost)
  .get(postsController.getFeed);

router.post('/:id/vote', postsController.votePost);
router.post('/:id/save', postsController.savePost);

router.route('/:id/comments')
  .post(postsController.addComment)
  .get(postsController.getComments);

module.exports = router;
