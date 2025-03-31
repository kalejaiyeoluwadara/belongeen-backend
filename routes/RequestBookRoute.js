const express = require("express");
const { Router } = express;
const router = Router();
const upload = require("../config/multer");
const RequestBookController = require("../controllers/RequestBookController");

//Private Routes
router.post(
  "/",
  upload.array("images", 1),
  RequestBookController.createBook
);

router.get("/", RequestBookController.fetchAllBooks);
router.get("/:id", RequestBookController.fetchBookById);

module.exports = router;
