const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const inputsDir = path.join(__dirname, "inputs");

if (!fs.existsSync(inputsDir)) {
  fs.mkdirSync(inputsDir);
}
const generateInputFile = async (input) => {
    const jobId = uuid();
    const inputFileName = `${jobId}.txt`
    const inputFilepath = path.join(inputsDir, inputFileName)
    fs.writeFileSync(inputFilepath, input);
    return inputFilepath;
};
module.exports = { generateInputFile };
