const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIMULADO por ahora (luego DB real)
const users = [];

exports.register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPassword });

  res.json({ message: "Usuario registrado correctamente" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Credenciales inválidas" });

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};
