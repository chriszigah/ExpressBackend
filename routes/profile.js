const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile");
const { check, validationResult } = require("express-validator");
const { ensureAuthenticated } = require("../middleware/auth");
const uploads = require("../middleware/localStorageAvatar");

//@route GET api/profile/me
// @desc Get current user profile
// @access Private

router.get("/me", ensureAuthenticated, profileController.getProfile);

//@route POST api/profile
//@desc Create or Update user profile
//@access Private

router.post(
    "/",
    [
        check("status", "Status is required!").not().isEmpty(),
        check("skills", "Skills is require").not().isEmpty(),
    ],
    ensureAuthenticated,
    profileController.createProfile
);

//@route GET api/profile
//@desc GET all profile
//@access Public

router.get("/", profileController.getAllProfiles);

//@route GET api/profile/:id
//@desc GET profile by user id
//@access Public

router.get("/:id", profileController.getProfileById);

//@route DELETE api/profile/delete
//@desc Delete profile, user & posts
//@access Private

router.delete(
    "/delete",
    ensureAuthenticated,
    profileController.deleteProfileById
);

//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private

router.put(
    "/profile/experience",
    [
        check("title", "Title is required").not().isEmpty(),
        check("company", "Company is required").not().isEmpty(),
        check("from", "From date is required").not().isEmpty(),
    ],
    ensureAuthenticated,
    profileController.addExperience
);

//@route DELETE /profile/delete/experience/:exp_id
//@desc Delete experience from profile
//@access Private

router.delete(
    "/experience/:exp_id",
    ensureAuthenticated,
    profileController.deleteExperience
);

//@route PUT api/profile/education
//@desc Add profile education
//@access Private

router.put(
    "/profile/education",
    [
        check("school", "School is required").not().isEmpty(),
        check("degree", "Degree is required").not().isEmpty(),
        check("filedofstudy", "Filed of study is required").not().isEmpty(),
        check("from", "From date is required").not().isEmpty(),
    ],
    ensureAuthenticated,
    profileController.addEducation
);

//@route DELETE /profile/delete/experience/:exp_id
//@desc Delete experience from profile
//@access Private

router.delete(
    "/experience/:edu_id",
    ensureAuthenticated,
    profileController.deleteEducation
);

//@route GET /profile/github/:username
//@desc Get user repos from Github
//@access Public
router.get("/github/:username", profileController.addGithubUsername);

//@route POST /profile/avatar/
//@desc Upload profile picture
//@access Private
router.post(
    "/avatar",
    ensureAuthenticated,
    uploads.single("avatar"),
    profileController.uploadAvatar
);

//@route PUT /profile/avatar/:filename
//@desc Update profile picture
//@access Private

router.put(
    "/avatar/:filename",
    ensureAuthenticated,
    uploads.single("avatar"),
    profileController.updateAvatar
);

//@route DELETE /profile/avatar/:filename
//@desc Delete profile picture
//@access Private
router.delete(
    "/avatar/:filename",
    ensureAuthenticated,
    profileController.deleteAvatar
);

module.exports = router;
