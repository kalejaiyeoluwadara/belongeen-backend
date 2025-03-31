const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    name: { type: String},
    author: { type: String},
    image: { type: String},
    createdAt: { type: Date, default: Date.now },


});

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;

