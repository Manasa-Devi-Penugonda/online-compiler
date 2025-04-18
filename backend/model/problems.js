const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  sampleInputs: {
    type: [String],
    required: true
  },
  sampleOutput: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  // Add a reference to the Testcase model
  testcases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Testcase'  // Reference to the Testcase model
  }]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
