const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión - ACTUALIZADA
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto_super_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Mantener en false si usas http://localhost
        sameSite: 'lax', // Ayuda a que las cookies se compartan correctamente tras los redirects de OAuth
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Importar y usar rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Rutas básicas
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    // Debug opcional: console.log(req.user); 
    res.render('profile', { user: req.user });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`También puedes probar en http://127.0.0.1:${PORT} para X (Twitter)`);
});