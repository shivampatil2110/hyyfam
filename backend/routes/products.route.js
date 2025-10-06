const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller")
const fns = require("../routes/common_functions/common_function");

router.post(
    "/deals",
    productsController.getDealsData
)

router.post(
    "/grabDealDeepLink",
    fns.isAuthenticated,
    productsController.grabDealDeepLinking
)

router.post(
    "/deeplink",
    fns.isAuthenticated,
    productsController.startDeepLinking
)

router.post(
    "/getdeeplink",
    productsController.getDeepLinkURL
)

router.get(
    "/storesbycat",
    productsController.getAllStoresByCategories
)

router.post(
    "/getStoreSchema",
    productsController.getStoreSchema
)

router.get(
    "/getStoreDescription",
    productsController.getStoreDescription
)

router.post(
    "/storeurl",
    fns.getUidInSession,
    productsController.getRedirectUrl
);

router.post(
    "/taskurl",
    fns.getUidInSession,
    productsController.getTaskRedirectUrl
);

module.exports = router;