const { exec } = require("child_process");
// const fs = require("fs");
// const path = require("path");

// const codesDir = path.join(__dirname, "codes");

// if (!fs.existsSync(codesDir)) {
//   fs.mkdirSync(codesDir);
// }
const executePython = async (filepath, inputFilePath) => {
    // const jobId = path.basename(filepath).split('.')[0]
    return new Promise((resolve, reject) => {
        exec(`python ${filepath} < ${inputFilePath}`, (error, stdout, stderr) => {
            if (error) reject(error.message);
            else if (stderr) reject(stderr);
            else resolve(stdout.trim());
        });
    });
};
module.exports = { executePython };
