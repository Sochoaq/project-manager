const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/projects", require("./routes/project.routes"));

module.exports = app;
