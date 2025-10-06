const express = require("express");
const router = express.Router();
const instagramController = require("../controllers/instagram.controller")
const fns = require("../routes/common_functions/common_function");

router.get(
    "/instagramAuth",
    instagramController.instaAuth
)

router.get(
    "/getAutoPosts",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.getAutoPost
)

router.get(
    "/getInstaPosts",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.getUserInstaPost
)

router.post(
    "/createAutoPost",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.createAutoPost
)

router.post(
    "/updateAutoPost",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.updateAutoPost
)

router.delete(
    "/deleteAutoPost",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.deleteAutoPost
)

router.get(
    "/getPostLinks",
    fns.isAuthenticated,
    fns.checkInsta,
    instagramController.getPostLinks
)

router.get(
    "/checkInstaAuth",
    fns.isAuthenticated,
    instagramController.checkInstaAuth
)

router.get(
    "/getUserSetting",
    fns.isAuthenticated,
    instagramController.getUserSetting
)

router.post(
    "/updateUserSetting",
    fns.isAuthenticated,
    instagramController.updateUserSetting
)

router.post(
    "/sendAutoDM",
    instagramController.sendAutoDM
)

router.get(
    "/sendAutoDM",
    instagramController.webhookVerification
)

router.get(
    "/getProfileSummary",
    fns.isAuthenticated,
    instagramController.getProfileSummary
)

router.post(
    "/checkPostSetup",
    fns.isAuthenticated,
    instagramController.checkPostSetup
)

module.exports = router;