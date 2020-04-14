const express = require('express');
const router = express.Router;
const { check, validationResult } = require("express-validator");
const Book = require("../models")
const Review = require("../models/Book");
const authenticator = require("../middlewares/Authenticator");

router.get("/", authenticator, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({date: -1})
      .where("users")
      .in(req.user.id)
      .exec();
    res.json({allReviews: reviews})
  } catch (err) {
      console.error(err);
  }
})

router.post(
  "/:Id",
  authenticator,[
  check(
    "reviewContent",
    "what do you have to say about this book"
  ).not().isEmpty(),
  check(
    "rating",
    "on the scale 1 to 5, how you rate this book"
  ).isNumber()
],
  async (req, res) => {

    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.status(422).json({errors: error.toArray()})
      }

      const { reviewContent, rating } = req.body;

      let bookID = req.params.Id;

      if (!bookId) {
        return res.status(404).json({msg: "book Id is not present"})
      }

      const book = await Book.findById(bookID);

      if (!book.user || book.user.toString() !== req.user.id) {
        return res.status(401).json({msg: "Not Authorized"})
      }

      const review = new Review({
        user: req.user.id,
        book: bookID,
        reviewContent,
        rating
      })

      await review.save()
      res.json({msg: "review has been successfully saved"});
    } catch (err) {
        return res.status(400).json({error: err})
    }
  }
)


router.delete("/:reviewId", authenticator, async(req, res, next) => {
  try {
    let reviewID = req.params.reviewId;
    const review = await Review.findById(reviewID);
    if (!reviewID) {
      return res.status(404).json({msg: "reviewID not found"});
    }

    if (!review.user || review.user.toString() !== req.user.id) {
      return res.status(401).json({msg: "Not Authorized"});
    }

    await review.remove();
    res.json({msg: "review has been successfully deleted"});
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({msg: "unable to find book"})
    }
    next(err);
  }
})


module.exports = router;
