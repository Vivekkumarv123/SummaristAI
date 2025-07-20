const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/crudDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// Create Model
const User = mongoose.model("User", userSchema);

// Routes

// Serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Create User
app.post("/create", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});

// Read Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Update User
app.post("/update", async (req, res) => {
  try {
    const { id, name, email } = req.body;
    await User.findByIdAndUpdate(id, { name, email });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating user");
  }
});

// Delete User
app.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
