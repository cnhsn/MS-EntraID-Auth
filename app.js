const express = require('express');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');

const authMiddleware = require('./auth'); // Assuming your 'auth.js' file

dotenv.config();

const app = express();

// Security-Oriented Middleware
app.set('trust proxy', 1); // Essential if behind a reverse proxy 
app.use(helmet()); // Sets security-related HTTP headers
app.disable('x-powered-by'); // Obscures technology details

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-strong-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // Enforce HTTPS in production
        httpOnly: true, // Mitigates XSS risks
        sameSite: 'lax' // Protection against some CSRF forms
    }
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session()); 

// Authentication (Protected Routes)
app.use(authMiddleware); 

app.get('/protected', (req, res) => {
    const user = req.user;
    res.send(`Protected Content. Hello, ${user.displayName}`); 
});

// General Routes
app.get('/', (req, res) => {
    res.send('Home Page');
});

// Error Handling (Consider Custom Error Pages)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Port Management
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
