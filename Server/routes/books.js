const express = require("express");
const router = express.Router();
const { check, validationResult }
const Book = require("../models/Book");
const authenticator = require("../middlewares/Authenticator");


router.get("/", authenticator, async(req, res) => {
    try {
      const books = await Book.find({})
        .sort({ date: -1})
        .where("users")
        .in(req.user.id)
        .exec();
      res.json({allbooks: books})
    } catch (err) {
      console.error(err);
    }
});

router.post("/",
            authenticator,
            [
              check(
                "bookTitle",
                "Enter the title of the book"
              ).not().isEmpty(),
              check(
                "bookLink",
                "Enter link to the book for user to view"
              ).isURL(),
              check(
                "bookAuthor",
                "Enter book author details"
              ).not().isEmpty(),
              check(
                "bookDescription",
                "You have give a good description of the book"
              ).not().isEmpty(),
              check(
                "bookImageLink",
                "Enter book thumbnail link here"
              ).isURL(),
            ],
            async (req, res) => {
                const errors = validationResult(req);
                if(!errors.isEmpty()) {
                  return res.status(422).json({errors: errors.array()});
                }

                const { bookAuthor, bookLink, bookImageLink, bookDescription, bookTitle } = req.body;

                try {
                  const book = new Book({
                    user: req.user.id,
                    bookAuthor,
                    bookLink,
                    bookImageLink,
                    bookDescription,
                    bookTitle
                  })

                  await book.save();

                  res.status(200).json({msg: "book successfully saved"})
                } catch (err) {
                  console.error(err);
                }
            }
)

router.get("/:Id", authenticator, async (req, res) => {
  let bookID = req.params.Id;

  if (!bookID) {
    return res.status(404).json({msg: "book Id not found!!!"})
  }

  const book = await Book.findById({bookID})

  if (!book.user || book.user.toString() !== req.user.id) {
    return res.status(401).json({msg: "this is not your book ooo!. Not Authorized"})
  }

  res.json({book});
})

router.delete("/:Id", authenticator, async (req, res, next) => {
  try {
    let bookId = req.params.Id;
    const book = Book.findById(bookId)
    if (!bookId) {
      return res.status(404).json({msg: "BookId not found!!"});
    }

    if (!book.user || link.user.toString() !== req.user.id) {
      return res.status(401).json({msg: "Not authorized"});
    }

    await book.remove()

    res.json({msg: "book has been successfully deleted"});
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({msg: " book could not be found"})
    }
    next(err);
  }
});

module.exports = router;
