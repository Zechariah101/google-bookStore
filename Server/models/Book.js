const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookLink: {
    type: String,
    required: true
  },
  bookAuthor: {
    type: String,
    required: true
  },
  bookDescription: {
    type: String,
    required: true
  },
  bookImageLink: {
    type: String,
    required: true
  },
  dateAdded:{
    type: Date,
    default: Date.now
  }
});

const bookModel = mongoose.model('books', bookSchema);

module.export = bookModel;
