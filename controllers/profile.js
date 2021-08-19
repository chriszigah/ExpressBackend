var { Profile } = require("../models/Profile"); 
var { User } = require("../models/user");
var request = require("request");
var config = require("../config/config");
var { validationResult } = require("express-validator");
var { client_id, client_secret } = config;
var fs = require("fs");
var sharp = require("sharp");
var randToken = require("rand-token");

// Generate Filename
const fileName = () => {
    return randToken.generate(32);  
};

exports.uploadAvatar = async (req, res, next) => {
    const avatarId = fileName() + ".jpg";

    try {
        // Create data folder if not exists
        fs.access("server/data/avatar", (err) => {
            if (err) {
                fs.mkdirSync("server/data/avatar");
            }
        });

        // Resize and store image to server/data/avatar+avatarid
        await sharp(req.file.buffer)
            .resize({ width: 300, height: 300, fit: "inside" })
            .toFile("server/data/avatar/" + avatarId);

        // Update profile with avatar location
        let profile = await Profile.findOne({ user: req.user.id });
        profile.avatar = avatarId;
        await profile.save();

        return res
            .status(200)
            .json({ mesage: "Profile Picture updated successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.updateAvatar = async (req, res, next) => {
    const avatarId = fileName() + ".jpg";
    const filename = req.params.filename;
    try {
        fs.unlinkSync(`server/data/avatar/${filename}`);

        // Create data folder if not exists
        fs.access("server/data/avatar", (err) => {
            if (err) {
                fs.mkdirSync("server/data/avatar");
            }
        });

        // Resize and store image to server/data/avatar+avatarid
        await sharp(req.file.buffer)
            .resize({ width: 300, height: 300, fit: "inside" })
            .toFile("server/data/avatar/" + avatarId);

        // Update profile with avatar location
        let profile = await Profile.findOne({ user: req.user.id });
        profile.avatar = avatarId;
        await profile.save();

        return res
            .status(200)
            .json({ mesage: "Profile Picture updated successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.deleteAvatar = async (req, res, next) => {
    const filename = req.params.filename;
    try {
        fs.unlinkSync(`server/data/avatar/${filename}`);

        //find user and update avatar to default.png
        let profile = await Profile.findOne({ user: req.user.id });
        profile.avatar = "default.png";
        await profile.save();
        res.status(200).json({
            success: true,
            mesage: "Pofile Picture delelted successfully",
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getProfile = async (req, res, next) => {
    console.log(`User ID ${req.user.id}`);
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        });

        if (!profile) {
            return res
                .status(400)
                .json({ msg: "There is no profile for this user" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.createProfile = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        avatar,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
    } = req.body;

    // Build Profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build Social Objecct
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.status(200).json({ profile });
        }

        //Create
        profile = new Profile(profileFields);
        await profile.save();
        return res.status(200).json({ profile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getAllProfiles = async (req, res, next) => {
    try {
        //Customer.findOne({}).populate('created_by', 'name email', User)
        const profiles = await Profile.find().populate("User", [
            "name",
            "lastname",
        ]);
        return res.status(200).json({ Profiles: profiles });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getProfileById = async (req, res, next) => {
    try {
        const profile = await Profile.find({
            user: req.params.id,
        }).populate("user", [name, avatar]);

        if (!profile) return res.status(400).json({ msg: "Profile not found" });
        return res.status(200).json({ Profile: profile });
    } catch (err) {
        console.error(err.message);
        if (err.kind == "ObjectId") {
            return res.status(400).json({ msg: "Profile not found" });
        }
        res.status(500).send("Server Error");
    }
};

exports.deleteProfileById = async (req, res, next) => {
    try {
        // @todo - remove user posts
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });

        return res
            .status(200)
            .json({ msg: "User & Profile Delelted successfully" });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

exports.addExperience = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

exports.deleteExperience = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

exports.addEducation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newEdu);

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

exports.deleteEducation = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.education
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

exports.addGithubUsername = async (req, res, next) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${client_id}&client_secret=${client_secret}`,
            method: "GET",
            HEADERS: { "user-agent": "node.js" },
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode != 200) {
                return res.status(400).json({ msg: "No Github profile found" });
            }
            return res.status(200).json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};
