const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    name: { type: String},
    price: { type: Number},
    image: { type: String},
});

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;

