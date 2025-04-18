const { exec } = require("child_process");
const path = require("path");

const executeCode = async (filepath, inputFilePath, language, timeout) => {
  return new Promise((resolve, reject) => {
    let command;

    switch (language.toLowerCase()) {
      case "python":
        command = `python ${filepath} < ${inputFilePath}`;
        break;
      case "cpp":
        const outputPath = filepath.replace(/\.cpp$/, "");
        command = `g++ ${filepath} -o ${outputPath} && ${outputPath} < ${inputFilePath}`;
        break;
      case "javascript":
        command = `node ${filepath} < ${inputFilePath}`;
        break;
      case "java":
        const dir = path.dirname(filepath);
        const className = path.basename(filepath, ".java");
        command = `javac ${filepath} && java -cp "${dir}" ${className} < ${inputFilePath}`;
        break;
      default:
        return reject("Unsupported language");
    }

    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        // ✅ Handle time limit exceeded
        if (error.killed || error.signal === "SIGTERM") {
          return reject(new Error("⚠️ Time Limit Exceeded"));
        }

        // Other execution error (like syntax/runtime error)
        return reject(new Error(`Execution error: ${stderr || error.message}`));
      }

      if (stderr) {
        return reject(new Error(`Runtime error: ${stderr}`));
      }

      resolve(stdout.trim());
    });
  });
};

module.exports = { executeCode };
