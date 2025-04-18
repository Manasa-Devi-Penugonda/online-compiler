const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateFile } = require("./generateFile");
const { executeCode } = require("./executeCode");
const { generateInputFile } = require("./generateInputFile");
const { DBconnection } = require("./database/db");
const User = require("./model/user");
const Problem = require("./model/problems");
const Testcase = require("./model/testCase");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
DBconnection();

const app = express();
app.use(express.json());
app.use(cors());

// =================== AUTH ROUTES ===================

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: "All input fields are required" });

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    user.token = token;
    res.status(200).json({ message: "User registered successfully", user });
  } catch (error) {
    console.log("Error in Register route", error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const existUser = await User.findOne({ email });
    if (!existUser) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: existUser._id, email: existUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log("ERROR in login route", error);
  }
});

// =================== RUN CODE ROUTE ===================

app.post("/run", async (req, res) => {
  try {
    const { language, code, input } = req.body;
    if (!code) return res.json({ message: "Code is required" });

    const filepath = await generateFile(code, language);
    const inputFilePath = await generateInputFile(input);
    const output = await executeCode(filepath, inputFilePath, language);

    res.json({ filepath, inputFilePath, output });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: error.toString() });
  }
});


// =================== PROBLEMS ROUTE ===================

app.post("/problems/add", async (req, res) => {
  try {
    const {
      title,
      description,
      sampleInputs,
      sampleOutput,
      level,
      testcases,
      inputFormat,
      outputFormat,
    } = req.body;

    // Step 1: Create the Problem document
    const problem = await Problem.create({
      title,
      description,
      sampleInputs,
      sampleOutput,
      level,
      outputFormat,
      inputFormat,
    });

    // Step 2: Create the Testcase documents and link them to the Problem
    const savedTestcases = await Promise.all(
      testcases.map(async (tc) => {
        const testcase = await Testcase.create({
          problemId: problem._id, // Reference to the created Problem
          inputs: tc.input,
          outputs: tc.output,
        });
        return testcase._id; // Return the _id of the created Testcase
      })
    );

    // Step 3: Update the Problem document to include the references to the created Testcases
    problem.testcases = savedTestcases;
    await problem.save();

    // Step 4: Send the response
    res
      .status(201)
      .json({
        message: "Problem and testcases saved",
        problem,
        testcases: savedTestcases,
      });
  } catch (err) {
    console.error("Error adding problem", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/problems", async (req, res) => {
  try {
    const problems = await Problem.find({}, "title level"); // only return title and level
    res.status(200).json(problems);
  } catch (err) {
    console.log("Error fetching problems", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/problems/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json(problem);
  } catch (err) {
    console.error("Error fetching problem by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/submit", async (req, res) => {
  try {
    const { language, code, problemId } = req.body;
    if (!code || !problemId) return res.json({ message: "Code and problem ID are required" });

    // Step 1: Find the problem and populate the testcases
    const problem = await Problem.findById(problemId).populate("testcases");
    const hiddenTestCases = problem.testcases; // All the test cases are now available in 'testcases'

    // Step 2: Loop through all the hidden test cases
    let allPassed = true;
    for (let test of hiddenTestCases) {
      const { inputs, outputs } = test;

      // Generate the file, input, and output for the test case
      const filepath = await generateFile(code, language);
      const inputFilePath = await generateInputFile(inputs);

      // Execute the code with the current input
      const output = await executeCode(filepath, inputFilePath, language);

      // Normalize and compare the output with the expected result
      const normalizedOutput = output.trim().replace(/\r?\n/g, '\n');
      const normalizedExpectedOutput = outputs.join("\n").trim().replace(/\r?\n/g, '\n');

      if (normalizedOutput !== normalizedExpectedOutput) {
        allPassed = false;
        break; // Exit early if any test case fails
      }
    }

    // Step 3: Return the result
    if (allPassed) {
      res.json({ result: "pass" });
    } else {
      res.json({ result: "fail" });
    }
  } catch (error) {
    console.error("Error during test case execution:", error);
    res.json({ error: error.message });
  }
});


app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.tokenExpire = Date.now() + 3600000; // valid for 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // Send Email (configure transporter with real credentials)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "manasadevipenugonda18@gmail.com",
        pass: "hkja wyjq esrw kywp",
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Reset link sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword; // Ideally hash it before saving
    user.resetToken = undefined;
    user.tokenExpire = undefined;

    await user.save();
    res.json({ message: "Password has been reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =================== START SERVER ===================

app.listen(3333, () => {
  console.log("server running at 3333");
});
