const VALID_STATUSES = new Set(['PLANNED', 'IN_PROGRESS', 'COMPLETED']);
const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH']);

const projects = [];
let nextProjectId = 1;

function clampProgress(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.round(num)));
}

exports.getProjects = (req, res) => {
  const userEmail = req.user.email;
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : '';

  let userProjects = projects.filter((p) => p.userEmail === userEmail);
  if (statusFilter && VALID_STATUSES.has(statusFilter)) {
    userProjects = userProjects.filter((p) => p.status === statusFilter);
  }

  return res.json(userProjects);
};

exports.getProjectStats = (req, res) => {
  const userEmail = req.user.email;
  const userProjects = projects.filter((p) => p.userEmail === userEmail);

  const counts = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };

  let progressSum = 0;
  for (const project of userProjects) {
    if (Object.prototype.hasOwnProperty.call(counts, project.status)) {
      counts[project.status] += 1;
    }
    progressSum += project.progress;
  }

  const total = userProjects.length;
  const averageProgress = total > 0 ? Math.round((progressSum / total) * 10) / 10 : 0;

  return res.json({
    total,
    byStatus: counts,
    averageProgress,
  });
};

exports.createProject = (req, res) => {
  const { title, description, status, priority, progress, targetDate } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'Project title is required' });
  }
  if (typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ message: 'Project description is required' });
  }

  const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : 'PLANNED';
  if (!VALID_STATUSES.has(normalizedStatus)) {
    return res.status(400).json({ message: 'Invalid status. Allowed: PLANNED, IN_PROGRESS, COMPLETED' });
  }

  const normalizedPriority = typeof priority === 'string' ? priority.toUpperCase() : 'MEDIUM';
  if (!VALID_PRIORITIES.has(normalizedPriority)) {
    return res.status(400).json({ message: 'Invalid priority. Allowed: LOW, MEDIUM, HIGH' });
  }

  const normalizedProgress = clampProgress(progress, normalizedStatus === 'COMPLETED' ? 100 : 0);

  const newProject = {
    id: nextProjectId++,
    title: title.trim(),
    description: description.trim(),
    status: normalizedStatus,
    priority: normalizedPriority,
    progress: normalizedProgress,
    targetDate: typeof targetDate === 'string' && targetDate.trim() ? targetDate.trim() : null,
    userEmail: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.push(newProject);
  return res.status(201).json(newProject);
};

exports.updateProject = (req, res) => {
  const id = Number(req.params.id);
  const project = projects.find((p) => p.id === id && p.userEmail === req.user.email);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { title, description, status, priority, progress, targetDate } = req.body || {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Project title cannot be empty' });
    }
    project.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ message: 'Project description cannot be empty' });
    }
    project.description = description.trim();
  }

  if (status !== undefined) {
    const normalizedStatus = String(status).toUpperCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status. Allowed: PLANNED, IN_PROGRESS, COMPLETED' });
    }
    project.status = normalizedStatus;
    if (normalizedStatus === 'COMPLETED' && progress === undefined) {
      project.progress = 100;
    }
  }

  if (priority !== undefined) {
    const normalizedPriority = String(priority).toUpperCase();
    if (!VALID_PRIORITIES.has(normalizedPriority)) {
      return res.status(400).json({ message: 'Invalid priority. Allowed: LOW, MEDIUM, HIGH' });
    }
    project.priority = normalizedPriority;
  }

  if (progress !== undefined) {
    const parsed = Number(progress);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
    }
    project.progress = Math.round(parsed);
  }

  if (targetDate !== undefined) {
    project.targetDate = typeof targetDate === 'string' && targetDate.trim() ? targetDate.trim() : null;
  }

  project.updatedAt = new Date().toISOString();
  return res.json(project);
};

exports.deleteProject = (req, res) => {
  const id = Number(req.params.id);
  const idx = projects.findIndex((p) => p.id === id && p.userEmail === req.user.email);

  if (idx === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const [deleted] = projects.splice(idx, 1);
  return res.json({ message: 'Project deleted', id: deleted.id });
};
