const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collection.controller");
const fns = require("../routes/common_functions/common_function");

router.post(
    "/createCollection",
    fns.isAuthenticated,
    fns.checkInsta,
    collectionController.InsertCollection
);

router.post(
    "/updateCollection",
    fns.isAuthenticated,
    fns.checkInsta,
    collectionController.updateCollection
);

router.delete(
    "/deleteCollection",
    fns.isAuthenticated,
    fns.checkInsta,
    collectionController.deleteCollection
);

router.get(
    "/getCollection",
    fns.isAuthenticated,
    fns.checkInsta,
    collectionController.getCollection
)

router.get(
    "/getCollectionLinks",
    fns.isAuthenticated,
    fns.checkInsta,
    collectionController.getCollectionLinks
)

router.post(
    "/convertSingleLink",
    fns.isAuthenticated,
    collectionController.convertSingleLink
)

router.get(
    "/getRecentLinks",
    fns.isAuthenticated,
    collectionController.getRecentlyAddedProducts
)

router.post(
    "/getProductDetails",
    fns.isAuthenticated,
    collectionController.getProductDetails
)

router.get(
    "/getPreviewCollection",
    collectionController.getPreviewCollection
)

router.get(
    "/getPreviewCollectionDetails",
    collectionController.getPreviewCollectionDetails
)

module.exports = router;