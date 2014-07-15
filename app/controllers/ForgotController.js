'use strict';

/**
 * Module Dependencies
 */

var User          = require('../models/User'),
    Config        = require('../../config/config'),
    Bcrypt        = require('bcrypt-nodejs'),
    Crypto        = require('crypto'),           // http://nodejs.org/api/Crypto.html#Crypto_Crypto
    Nodemailer    = require('nodemailer');


/**
 * Forgot Controller
 */

/**

  The general outline of the best practice is:

  1) Identify the user is a valid account holder. Use as much information as practical.
      - Email Address  (*Bare Minimin*)
      - Username
      - Account Number
      - Security Questions
      - Etc.

  2) Create a special one-time (nonce) token, with a expiration period, tied to the person's account.
     In this example We will store this in the database on the user's record.

  3) Send the user a link which contains the route ( /reset/:id/:token/ ) where the
     user can change their password.

  4) When the user clicks the link:
      - Lookup the user/nonce token and check expiration. If any issues send a message
        to the user: "this link is invalid".
      - If all good then continue - render password reset form.

  5) The user enters their new password (and possibly a second time for verification)
     and posts this back.

  6) Validate the password(s) meet complexity requirements and match.  If so, hash the
     password and save it to the database.  Here we will also clear the reset token.

  7) Email the user "Success, your password is reset".  This is important in case the user
     did not initiate the reset!

  7) Redirect the user.  Could be to the login page but since we know the users email and
     password we can simply authenticate them and redirect to a logged in location - usually
     home page.

*/

module.exports.controller = function (app) {

  /**
   * GET /forgot
   * Forgot your password page.
   */

  app.get('/forgot', function (req, res) {
    if (req.user) {
      return res.redirect('/');  // user already logged in!
    }
    res.render('account/forgot', {
      url: req.url
    });
  });

  /**
   * POST /forgot
   * Reset Password.
   * @param {string} email
   */

  app.post('/forgot', function (req, res) {

    // Begin a workflow
    var workflow = new (require('events').EventEmitter)();

    /**
     * Step 1: Is the email valid?
     */

    workflow.on('validate', function () {

      // Check for form errors
      req.assert('email', 'Email cannot be blank.').notEmpty();
      req.assert('email', 'Please enter a valid email address.').isEmail();

      var errors = req.validationErrors();

      if (errors) {
        req.flash('error', errors);
        return res.redirect('/forgot');
      }

      // next step
      workflow.emit('generateToken');
    });

    /**
     * Step 2: Generate a one-time (nonce) token
     */

    workflow.on('generateToken', function () {
      // generate token
      Crypto.randomBytes(21, function (err, buf) {
        var token = buf.toString('hex');
        // hash token
        Bcrypt.genSalt(10, function (err, salt) {
          Bcrypt.hash(token, salt, null, function (err, hash) {
            // next step, pass token, hash
            workflow.emit('saveToken', token, hash);
          });
        });
      });
    });

    /**
     * Step 3: Save the token and token expiration
     */

    workflow.on('saveToken', function (token, hash) {
      // lookup user
      User.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
        if (err) {
          req.flash('error', { msg: err.message });
          return res.redirect('/forgot');
        }
        if (!user) {
          // If we didn't find a user associated with that
          // email address then just finish the workflow
          // If we tell them "no account exists" we are leaking
          // information
          req.flash('warning', { msg: 'Hmmm... is that your correct email address?' });
          return res.redirect('/forgot');
        }

        var hour = 3600000;
        var expiration = (hour * 4);

        user.resetPasswordToken = hash;
        user.resetPasswordExpires = Date.now() + expiration;

        // update the user's record with the token
        user.save(function (err) {
          if (err) {
            req.flash('error', { msg: err.message });
            return res.redirect('/forgot');
          }
        });

        // next step
        workflow.emit('sendEmail', token, user);
      });
    });

    /**
     * Step 4: Send the user an email with a reset link
     */

    workflow.on('sendEmail', function (token, user) {

      // Create a reusable nodemailer transport method (opens a pool of SMTP connections)
      var smtpTransport = nodemailer.createTransport('SMTP',{
        service: 'Gmail',
        auth: {
          user: Config.gmail.user,
          pass: Config.gmail.password
        }
      });

      // Render HTML to send using .jade mail template (just like rendering a page)
      res.render('mail/passwordReset', {
        name:          user.profile.name,
        resetLink:     req.protocol + '://' + req.headers.host + '/reset/' + user.id + '/' + token,
        mailtoName:    Config.smtp.name,
        mailtoAddress: Config.smtp.address
      }, function (err, html) {
        if (err) {
          return (err, null);
        }
        else {

          // Now create email text (multiline string as array FTW)
          var text = [
            'Hello ' + user.profile.name + '!',
            'Here is a special link that will allow you to reset your password. Please note it will expire in four hours for your protection:',
            req.protocol + '://' + req.headers.host + '/reset/' + user.id + '/' + token,
            'Thanks so much for using our services! If you have any questions, or suggestions, feel free to email us here at ' + Config.smtp.address + '.',
            '  - The ' + Config.smtp.name + ' team'
          ].join('\n\n');

          // Create email
          var mailOptions = {
            to:       user.profile.name + ' <' + user.email + '>',
            from:     Config.smtp.name + ' <' + Config.smtp.address + '>',
            subject:  'Reset your ' + app.locals.application + ' password',
            text:     text,
            html:     html
          };

          // send email via nodemailer
          smtpTransport.sendMail(mailOptions, function (err) {
            if (err) {
              req.flash('error', { msg: err.message });
              return res.redirect('/forgot');
            }
            // shut down the connection pool, no more messages
            smtpTransport.close();
          });

          // Message to user
          req.flash('success', { msg: 'We sent you an email with further instructions. Check your email!' });
          res.redirect('/forgot');

        }
      });

    });

    /**
     * Initiate the workflow
     */

    workflow.emit('validate');

  });

};
