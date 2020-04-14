const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "books"
  },
  reviewContent: {
    type: String,
    required: true
  },
  rating: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const reviewModel = mongoose.model("reviews", reviewSchema);

module.exports = reviewModel
