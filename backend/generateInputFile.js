const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const inputsDir = path.join(__dirname, "inputs");

if (!fs.existsSync(inputsDir)) {
  fs.mkdirSync(inputsDir);
}

const generateInputFile = async (input) => {
  const jobId = uuid();
  const inputFileName = `${jobId}.txt`;
  const inputFilepath = path.join(inputsDir, inputFileName);

  // If input is an array, join with newline; otherwise, use as-is
  const inputContent = Array.isArray(input) ? input.join("\n") : input;

  fs.writeFileSync(inputFilepath, inputContent);
  return inputFilepath;
};

module.exports = { generateInputFile };
