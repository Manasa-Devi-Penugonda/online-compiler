const { exec } = require("child_process");
const path = require("path");

const executeCode = async (filepath, inputFilePath, language) => {
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
        // Extract class name from file (e.g., Solution.java => Solution)
        const className = path.basename(filepath, ".java");
        command = `javac ${filepath} && java -cp "${dir}" ${className} < ${inputFilePath}`;
        break;

      default:
        return reject(`Unsupported language: ${language}`);
    }

    exec(command, (error, stdout, stderr) => {
      if (error) return reject(`Execution error: ${error.message}`);
      if (stderr) return reject(`Runtime error: ${stderr}`);
      return resolve(stdout.trim());
    });
  });
};

module.exports = { executeCode };
