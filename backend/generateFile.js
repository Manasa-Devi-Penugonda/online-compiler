const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const codesDir = path.join(__dirname, "codes");

if (!fs.existsSync(codesDir)) {
  fs.mkdirSync(codesDir);
}

const generateFile = async (code, language) => {
  const jobId = uuid();
  let fileName;

  if (language.toLowerCase() === "java") {
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : "Solution";
    fileName = `${className}.java`;
  } else {
    fileName = `${jobId}.${language}`;
  }

  const filepath = path.join(codesDir, fileName);

  if (language.toLowerCase() === "javascript") {
    const inputWrapper = `
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let input = [];

rl.on('line', (line) => {
  input.push(...line.trim().split(" ").map(Number));
});

rl.on('close', () => {
  try {
    const runUserCode = () => {
      ${code}
    };
    runUserCode();
  } catch (error) {
    console.error("Error in user code:", error);
  }
});
    `;
    fs.writeFileSync(filepath, inputWrapper.trim());
  } else {
    fs.writeFileSync(filepath, code);
  }

  return filepath;
};

module.exports = { generateFile };
