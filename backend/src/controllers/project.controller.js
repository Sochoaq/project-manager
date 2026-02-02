// simulamos DB
const projects = [];

exports.getProjects = (req, res) => {
  const userEmail = req.user.email;

  const userProjects = projects.filter(
    p => p.userEmail === userEmail
  );

  res.json(userProjects);
};

exports.createProject = (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      message: "El título es obligatorio"
    });
  }

  if (!description || description.trim() === "") {
    return res.status(400).json({
      message: "La descripción es obligatoria"
    });
  }

  const newProject = {
    id: projects.length + 1,
    title: title.trim(),
    description: description.trim(),
    userEmail: req.user.email,
    createdAt: new Date()
  };

  projects.push(newProject);

  res.status(201).json(newProject);
};
