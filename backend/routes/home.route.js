const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");
const fns = require("../routes/common_functions/common_function");

router.get(
    "/getStories",
    homeController.getStories
)

router.get(
    "/getUpcomingSales",
    homeController.getUpcomingSales
)

router.get(
    "/getNotification",
    homeController.getNotification
)

router.get(
    "/getTask",
    homeController.getTask
)

router.get(
    "/gettaskbyurl",
    fns.getUidInSession,
    homeController.gettaskbyurl
);

router.get(
    "/getBonusStatus",
    fns.isAuthenticated,
    homeController.getBonusStatus
);

router.get(
    "/getBestEarning",
    homeController.getBestEarning
);

router.get(
    "/getTotalComission",
    fns.isAuthenticated,
    homeController.getTotalComission
);

router.get(
    "/getBanners",
    fns.isAuthenticated,
    homeController.getBanners
);


module.exports = router;