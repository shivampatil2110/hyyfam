const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require("../controllers/auth.controller")
const pointsController = require("../controllers/points.controller")
const fns = require("../routes/common_functions/common_function");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
})
router.post("/login", authController.loginWithPassword);
router.post("/sendmobotp", authController.sendMobileOtp);
router.post("/sendloginotp", authController.sendLoginOtp);
router.post("/verifymobile", authController.verifyMobile);
router.post("/otplogin", authController.loginWithOtp);
router.post("/forgotpassword", authController.forgotPassword);
router.post("/sendotpforgetpassword", authController.sendMobileOtpForgetPassword);
router.post("/signup", fns.getUidInSession, authController.signup);
router.post("/logout", authController.logout);
router.get("/profile", fns.isAuthenticated, authController.getProfile);
router.post("/uploadProfilePicture", fns.isAuthenticated, upload.single('image'), authController.uploadProfilePicture)

router.post(
    "/addpaydetails",
    fns.isAuthenticated,
    pointsController.addUserPaymentInfo
);

router.post(
    "/removepaydetails",
    fns.isAuthenticated,
    pointsController.removeUserPaymentInfo
);

router.get(
    "/userpayinfo",
    fns.isAuthenticated,
    pointsController.getUserPaymentInfo
);

router.get(
    "/getRedemptionHistory",
    fns.isAuthenticated,
    pointsController.getRedemptionHistory
);

router.post(
    "/redeemrequest",
    [fns.isAuthenticated, fns.completeUserProfile],
    pointsController.redeemPointsRequest
);

router.get(
    "/getUserProfile",
    fns.isAuthenticated,
    authController.getUserProfile
);

router.post(
    "/updateProfile",
    fns.isAuthenticated,
    authController.updateUserExtraDetails
);

router.post(
    "/sendverificationemail",
    fns.isAuthenticated,
    authController.sendverificationemail
);
router.get("/:token", authController.verifyEmail)

module.exports = router;