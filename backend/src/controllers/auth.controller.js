const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  console.log("1️⃣ Entró a la función register");
  try {
    const { email, password } = req.body;
    console.log("2️⃣ Datos recibidos:", { email, password });

    if (!email || !password) {
      console.log("3️⃣ Error: Faltan campos");
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    console.log("4️⃣ Resultado de búsqueda:", userExists.rows);

    if (userExists.rows.length > 0) {
      console.log("5️⃣ Usuario ya existe");
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("6️⃣ Password encriptado:", hashedPassword);

    // Insertar usuario
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    console.log("7️⃣ Usuario insertado:", newUser.rows);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error("❌ Error en catch:", error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.login = async (req, res) => {
  console.log("🔐 Entró a la función login");
  try {
    const { email, password } = req.body;
    console.log("📧 Email recibido:", email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    // Buscar usuario por email
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      console.log("❌ Contraseña incorrecta");
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET || 'secret_key', // Más adelante lo pondremos en .env
      { expiresIn: '2h' }
    );

    console.log("✅ Login exitoso, token generado");
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email
      }
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: 'Error en servidor' });
  }
};