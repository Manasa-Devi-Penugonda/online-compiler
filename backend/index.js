const express = require("express");
const { generateFile } = require("./generateFile");
const { executePython } = require("./executePython");
const cors = require('cors');
const { generateInputFile } = require("./generateInputFile");
const { DBconnection } = require("./database/db");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
DBconnection();
const app = express();
app.use(express.json())
app.use(cors())

app.post("/register", async (req, res) => {
  try {
    // get the input data
    const { firstName, lastName, email, password } = req.body;

    // check if all the values are present or not
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: "All input fields are required" });
    }

    // check if the user already exists in db or not
    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400).json({ error: "User already exists" });
    }

    // encrpt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save the user data to the database
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // generate a token and sent to the user
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
    //get all the data from the request
    const { email, password } = req.body;

    //check all the data should present
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // find the user in database
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // match or compare the password
    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Generate JWT Token
    const token = jwt.sign(
      { id: existUser._id, email: existUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    // store cookies and send the token
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60 * 1000, // 4 hours expiration
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log("ERROR in login route", error);
  }
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
