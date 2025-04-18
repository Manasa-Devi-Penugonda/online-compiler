const mongoose = require('mongoose');

const testcaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
      },
      inputs: {
        type: [String],
        required: true
      },
      outputs: {
        type: [String],
        required: true
      }
})

module.exports = mongoose.model('Testcase', testcaseSchema);