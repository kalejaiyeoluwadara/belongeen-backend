const express = require("express");
const { Router } = express;
const router = Router();
const upload = require("../config/multer");
const RequestBookController = require("../controllers/RequestBookController");

//Private Routes
router.post(
  "/create-book",
  upload.array("images", 1),
  RequestBookController.createBook
);

router.get("/all-books", RequestBookController.fetchAllBooks);
router.get("/book/:id", RequestBookController.fetchBookById);

module.exports = router;
