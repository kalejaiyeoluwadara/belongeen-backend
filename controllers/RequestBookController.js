const Book = require("../models/Books");
const createBookController = {
    createBook: async (req, res) => {
        try {
            const { name, author } = req.body; 
            let image = null; 

            // Check if `req.files` exists and contains at least one file
            if (req.files && req.files.length > 0) {
                image = req.files[0].path;
            }

            // Check if all fields are provided
            if (!name || !author) {
                return res.status(400).json({ error: "All fields are required" });
            }

            // Create and save the book with or without an image
            const book = await Book.create({ name, author, image });
            res.status(201).json(book);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    fetchAllBooks: async (req, res) => {
        try {
            const books = await Book.find();
            res.status(200).json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    fetchBookById: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }
            res.status(200).json(book);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    DeleteBookRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await Book.findByIdAndDelete(id);
            if (!book) {
                return res.status(404).json({ error: "Book request not found" });
            }
            res.status(200).json({ message: "Book request deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = createBookController;
