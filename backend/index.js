const express = require("express");
const { generateFile } = require("./generateFile");
const { executePython } = require("./executePython");
const cors = require('cors');
const { generateInputFile } = require("./generateInputFile");

const app = express();
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.post("/run", async(req, res) => {
  try {
    const { language, code, input } = req.body;
    if(!code){
        return res.json({message: "code is required"})
    }
    const filtepath = await generateFile(code, language)
    const inputFilePath = await generateInputFile(input)
    const output = await executePython(filtepath, inputFilePath);
    res.json({ filtepath, output, inputFilePath });
  } catch (error) {
    console.log("error", error);
    res.json({ error: error.message });
  }
});

app.listen(8888, () => {
  console.log("server running at 8888");
});
