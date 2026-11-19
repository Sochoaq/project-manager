const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
  getProjects,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');

router.get('/stats', auth, getProjectStats);
router.get('/', auth, getProjects);
router.post('/', auth, createProject);
router.patch('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;
