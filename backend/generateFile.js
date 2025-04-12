const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const codesDir = path.join(__dirname, "codes");

if (!fs.existsSync(codesDir)) {
  fs.mkdirSync(codesDir);
}
const generateFile = async (code, language) => {
    const jobId = uuid();
    const fileName = `${jobId}.${language}`
    const filepath = path.join(codesDir, fileName)
    fs.writeFileSync(filepath, code);
    return filepath;
};
module.exports = { generateFile };
