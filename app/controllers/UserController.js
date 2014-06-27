'use strict';

var Injct = require('injct'),
     _ = require('lodash'),
    Async = require('async'),
    Crypto = require('crypto'),
    Nodemailer = require('nodemailer'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport'),
    User = require('../models/User');



/**
 * GET /login
 * Login page.
 *
 * @param req
 * @param res
 */
var getLogin = function(req, res) {
    if (req.user) return res.redirect('/');
    res.render('account/login', {
        title: 'Login'
    });
};

/**
 * POST /login
 * Sign in using email and password.
 * @param req
 * @param res
 */
var postLogin = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    Passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            req.flash('errors', { msg: info.message });
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            req.flash('success', { msg: 'Success! You are logged in.' });
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);
};


/**
 * GET /logout
 * Log out.
 */
var logout = function(req, res) {
    req.logout();
    res.redirect('/');
};


/**
 * GET /signup
 * Signup page.
 */
var getSignup = function(req, res) {
    if (req.user) return res.redirect('/');
    res.render('account/signup', {
        title: 'Create Account'
    });
};

/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
 */
var postSignup = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    var user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.model().findOne({ email: req.body.email }, function(err, existingUser) {
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.model().save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
                if (err) return next(err);
                res.redirect('/');
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
var getAccount = function(req, res) {
    res.render('account/profile', {
        title: 'Account Management'
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
var postUpdateProfile = function(req, res, next) {

    var userService = Injct.getInstance('userService');

    userService.getUserById(req.user._id, function(err, user) {
        if (err) return next(err);
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';

        userService.updateUser(user, function(err, result) {
            if (err) return next(err);
            req.flash('success', { msg: 'Profile information updated.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 * @param password
 */
var postUpdatePassword = function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, function(err, user) {
        if (err) return next(err);

        user.password = req.body.password;

        user.save(function(err) {
            if (err) return next(err);
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
var postDeleteAccount = function(req, res, next) {
    User.remove({ _id: req.user.id }, function(err) {
        if (err) return next(err);
        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 * @param provider
 */
var getOauthUnlink = function(req, res, next) {
    var provider = req.params.provider;
    User.findById(req.user.id, function(err, user) {
        if (err) return next(err);

        user[provider] = undefined;
        user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

        user.save(function(err) {
            if (err) return next(err);
            req.flash('info', { msg: provider + ' account has been unlinked.' });
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
var getReset = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
            if (!user) {
                req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Password Reset'
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 * @param token
 */
var postReset = function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    Async.waterfall([
        function(done) {
            User
                .findOne({ resetPasswordToken: req.params.token })
                .where('resetPasswordExpires').gt(Date.now())
                .exec(function(err, user) {
                    if (!user) {
                        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                        return res.redirect('back');
                    }

                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        if (err) return next(err);
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
        },
        function(user, done) {
            var smtpTransport = Nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: secrets.sendgrid.user,
                    pass: secrets.sendgrid.password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'hackathon@starter.com',
                subject: 'Your Hackathon Starter password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', { msg: 'Success! Your password has been changed.' });
                done(err);
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
var getForgot = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Forgot Password'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email
 */
var postForgot = function(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    Async.waterfall([
        function(done) {
            Crypto.randomBytes(16, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
                if (!user) {
                    req.flash('errors', { msg: 'No account with that email address exists.' });
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = Nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: secrets.sendgrid.user,
                    pass: secrets.sendgrid.password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'hackathon@starter.com',
                subject: 'Reset your password on Hackathon Starter',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
};

Heisenberg.get('/login', getLogin);
Heisenberg.post('/login', postLogin);
Heisenberg.get('/logout', logout);
Heisenberg.get('/forgot', getForgot);
Heisenberg.post('/forgot', postForgot);
Heisenberg.get('/reset/:token', getReset);
Heisenberg.post('/reset/:token', postReset);
Heisenberg.get('/signup', getSignup);
Heisenberg.post('/signup', postSignup);
Heisenberg.get('/account', PassportConf.isAuthenticated, getAccount);
Heisenberg.post('/account/profile', PassportConf.isAuthenticated, postUpdateProfile);
Heisenberg.post('/account/password', PassportConf.isAuthenticated, postUpdatePassword);
Heisenberg.post('/account/delete', PassportConf.isAuthenticated, postDeleteAccount);
Heisenberg.get('/account/unlink/:provider', PassportConf.isAuthenticated, getOauthUnlink);








