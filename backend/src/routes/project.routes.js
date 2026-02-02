const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  getProjects,
  createProject
} = require("../controllers/project.controller");

// rutas protegidas
router.get("/", auth, getProjects);
router.post("/", auth, createProject);

module.exports = router;
