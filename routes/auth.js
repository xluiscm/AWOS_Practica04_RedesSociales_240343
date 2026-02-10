const router = require('express').Router();
const passport = require('passport');

// --- 1. ESTRATEGIAS ---
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const TwitchStrategy = require('passport-twitch-new').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;

// --- 2. CONFIGURACIÓN ---

// Twitch Strategy con Mapeo de Perfil
passport.use(new TwitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: process.env.TWITCH_CALLBACK_URL,
    scope: "user:read:email"
}, (accessToken, refreshToken, profile, done) => {
    // Mapeo manual para asegurar que el nombre y la foto aparezcan
    profile.displayName = profile.display_name; // Twitch usa display_name

    // Si Twitch envía imagen, la guardamos en el formato que espera el EJS
    if (profile.profile_image_url) {
        profile.photos = [{ value: profile.profile_image_url }];
    }

    return done(null, profile);
}));

// Estrategias Adicionales
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email']
}, (at, rt, profile, done) => done(null, profile)));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
}, (at, rt, profile, done) => done(null, profile)));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
}, (t, ts, profile, done) => done(null, profile)));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, (at, rt, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// --- 3. RUTAS ---

// Twitch Routes
router.get('/auth/twitch', passport.authenticate('twitch'));
router.get('/auth/twitch/callback',
    passport.authenticate('twitch', { successRedirect: '/profile', failureRedirect: '/' })
);

// Otras rutas
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/' }));
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/profile', failureRedirect: '/' }));
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/profile', failureRedirect: '/' }));
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback', passport.authenticate('discord', { successRedirect: '/profile', failureRedirect: '/' }));

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        // Destruimos la sesión en el servidor
        req.session.destroy((err) => {
            if (err) console.log("Error al destruir sesión:", err);
            // Borramos la cookie del navegador
            res.clearCookie('connect.sid');
            // Redirigimos al inicio
            res.redirect('/');
        });
    });
});
module.exports = router;