const router = require('express').Router();
const passport = require('passport');

// --- 1. ESTRATEGIAS ---
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;

// --- 2. CONFIGURACIÓN ---

// LinkedIn - Configuración OpenID Connect con manejo de errores
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['openid', 'profile', 'email'],
    state: true,
    userProfileURL: "https://api.linkedin.com/v2/userinfo" 
}, (accessToken, refreshToken, profile, done) => {
    try {
        const userProfile = {
            id: profile.id || (profile._json && profile._json.sub),
            displayName: profile.displayName || (profile._json && profile._json.name),
            emails: profile.emails || (profile._json ? [{ value: profile._json.email }] : []),
            photos: profile.photos || (profile._json ? [{ value: profile._json.picture }] : []),
            provider: 'linkedin'
        };
        return done(null, userProfile);
    } catch (e) {
        return done(e);
    }
}));

// Otras Estrategias
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

// LinkedIn Callback Protegido
router.get('/auth/linkedin', passport.authenticate('linkedin'));
router.get('/auth/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', (err, user) => {
        if (err) {
            console.log("💡 Info: Intento de LinkedIn fallido o caducado.");
            return res.redirect('/');
        }
        if (!user) return res.redirect('/');
        req.login(user, () => res.redirect('/profile'));
    })(req, res, next);
});

// Rutas Estándar
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/' }));

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/profile', failureRedirect: '/' }));

router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/profile', failureRedirect: '/' }));

router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback', passport.authenticate('discord', { successRedirect: '/profile', failureRedirect: '/' }));

// Logout Limpio
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });
});

module.exports = router;