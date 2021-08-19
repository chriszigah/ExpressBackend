var Post = require("../models/Post");
var Profile = require("../models/Profile");
var User = require("../models/user");
var request = require("request");
var config = require("../config/config");
var { validationResult } = require("express-validator");

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors.array());
    }
    try {
        //await User.findById(req.user.id).select('-password')
        const user = await User.findById(req.user.id);

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
        });

        const post = await newPost.save();

        return res.status(200).json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ date: -1 });

        return res.status(200).json({ Posts: posts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getPostById = async (req, res, next) => {
    try {
        console.log(req.params.id);
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        return res.status(200).json({ Post: post });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).send("Server Error");
    }
};

exports.deletePostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        //check user
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        await post.remove();

        return res.status(200).json({ msg: "Post was removed" });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).send("Server Error");
    }
};

exports.likePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors.array());
    }
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length > 0
        ) {
            return res.status(400).json({ msg: "Post alredy liked" });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        return res.status(200).json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).send("Server Error");
    }
};

exports.unLikePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors);
    }
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length === 0
        ) {
            return res.status(400).json({ msg: "Post has not yet been liked" });
        }

        // Get in remove index
        const removeIndex = post.likes.map((like) =>
            like.user.toString().indexOf(req.user.id)
        );

        post.likes.splice(removeIndex, 1);

        await post.save();

        return res.status(200).json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).send("Server Error");
    }
};

exports.commentOnPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.errors);
    }
    try {
        //await User.findById(req.user.id).select('-password')
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
        };

        post.comments.unshift(newComment);

        await post.save();

        return res.status(200).json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.deleteComment = async (req, res, next) => {
    console.log(req.params);
    try {
        const post = await Post.findById(req.params.post_id);

        // Pull out comment
        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        // Make sue comment exists
        if (!comment) {
            return res.status(404).json({ msg: "Comment does not exist" });
        }

        // Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        // Get in remove index
        const removeIndex = post.comments.map((comment) =>
            comment.user.toString().indexOf(req.user.id)
        );

        post.comments.splice(removeIndex, 1);

        await post.save();

        return res.status(200).json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
