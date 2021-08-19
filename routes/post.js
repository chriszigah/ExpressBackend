var express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const { check, validationResult } = require("express-validator");
const { ensureAuthenticated } = require("../middleware/auth");

// @route POST api/posts
// @desc Create a post
// @access Private

router.post(
    "/add",
    ensureAuthenticated,
    [check("text", "Test is require").not().isEmpty()],
    postController.createPost
);

// @route GET /posts
// @desc Get all posts
// @access Private

router.get("/", ensureAuthenticated, postController.getAllPosts);

// @route GET /posts/:id
// @desc Get post by ID
// @access Private

router.get("/:id", ensureAuthenticated, postController.getPostById);

// @route DELETE /posts/:id
// @desc Delete post by ID
// @access Private

router.delete("/:id", ensureAuthenticated, postController.deletePostById);

// @route PUT /posts/like/:id
// @desc Like a post
// @access Private

router.put("/like/:id", ensureAuthenticated, postController.likePost);

// @route PUT /posts/unlike/:id
// @desc Unlike a post
// @access Private

router.put("/unlike/:id", ensureAuthenticated, postController.unLikePost);

// @route POST /posts/comment/:id
// @desc Comment on a post
// @access Private

router.post(
    "/comment/:id",
    ensureAuthenticated,
    [check("text", "Text is require").not().isEmpty()],
    postController.commentOnPost
);

// @route DELETE /post/comment/:id/:comment_id
// @desc Delete comment
// @access Private

router.delete(
    "/comment/:post_id/:comment_id",
    ensureAuthenticated,
    postController.deleteComment
);

module.exports = router;
