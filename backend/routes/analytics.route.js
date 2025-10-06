const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const fns = require("../routes/common_functions/common_function");

router.get(
    "/getDailyReport",
    fns.isAuthenticated,
    analyticsController.getDailyReport
)

router.get(
    "/getPostReport",
    fns.isAuthenticated,
    analyticsController.getPostReport
)

router.get(
    "/getCollectionReport",
    fns.isAuthenticated,
    analyticsController.getCollectionReport
)

router.get(
    "/getProductReport",
    fns.isAuthenticated,
    analyticsController.getProductReport
)

router.get(
    "/getBrandReport",
    fns.isAuthenticated,
    analyticsController.getBrandReport
)

router.get(
    "/getOrderStatus",
    fns.isAuthenticated,
    analyticsController.getOrderStatus
)

router.get(
    "/getAmountStatus",
    fns.isAuthenticated,
    analyticsController.getAmountStatus
)

router.get(
    "/getTransactionReport",
    fns.isAuthenticated,
    analyticsController.getTransactionReport
)

router.get(
    "/getEarningsGraph",
    fns.isAuthenticated,
    analyticsController.getEarningsGraph
)

router.post(
    "/getCashbackDetails",
    fns.isAuthenticated,
    analyticsController.getCashbackDetails
)

router.post(
    "/getLinkReport",
    fns.isAuthenticated,
    analyticsController.getLinkReport
)

router.post(
    "/getUserEarningWallet",
    fns.isAuthenticated,
    analyticsController.getUserEarningWallet
)

router.get(
    "/getUserSummary",
    fns.isAuthenticated,
    analyticsController.getUserSummary
)

module.exports = router;