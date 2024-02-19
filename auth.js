const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Function to verify and process the ID token
function verifyIdToken(idToken, done) {
  try {
    const decoded = jwt.verify(idToken, process.env.CLIENT_SECRET, {
      audience: process.env.CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0` // Adapt as needed
    });

    // Add any additional validation on decoded payload here
    // Example: 
    // if (decoded.someField !== 'expectedValue') { 
    //  return done(new Error('Invalid token')); 
    // } 

    return done(null, decoded);
  } catch (err) {
      return done(err);
  }
}

passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET, 
    responseType: 'code id_token', //  Request both
    responseMode: 'form_post', 
    redirectUrl: process.env.REDIRECT_URI,
    allowHttpForRedirectUrl: false, // Enforce HTTPS for redirection in production
    passReqToCallback: true
}, verifyIdToken));

passport.serializeUser((user, done) => {
    done(null, user.oid); // Or serialize relevant user data as preferred
});

passport.deserializeUser((oid, done) => {
    // ... Logic to fetch user details if needed ...
    done(null, { oid: oid }); // Simplified; modify as needed
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    passport.authenticate('azuread-openidconnect', { 
        failureRedirect: '/login', // Distinct error page advised
        successReturnToOrRedirect: '/' // Adjust return paths as needed
    })(req, res, next); 
};

// Enhanced Group Membership Check
function checkGroupMembership(allowedGroups, userGroups) {
    if (!allowedGroups || allowedGroups.length === 0) return true; // Bypass if empty

    // Optimized check (assuming group IDs in 'userGroups'):
    return allowedGroups.some(groupId => userGroups.includes(groupId));  
}

module.exports = { authMiddleware, checkGroupMembership }; // Export both
