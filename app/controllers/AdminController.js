'use strict';

/**
 * Module Dependencies
 */

var User          = require('../models/User'),
    PassportConf  = require('../../config/passport');

/**
 * Admin Pages Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /dashboard
   * Render Dashboard Page
   */

  app.get('/dashboard', PassportConf.isAuthenticated, PassportConf.isAdministrator, function (req, res) {
    User.model().count({}, function (err, count) {
      if (err) {
        return (err, null);
      }
      res.render('admin/dashboard', {
        url: '/administration',  // to set navbar active state
        accounts: count
      });
    });
  });

  /**
   * GET /accounts
   * Render accounts page
   */

  app.get('/accounts', PassportConf.isAuthenticated, PassportConf.isAdministrator, function (req, res) {
    res.render('admin/accounts', {
      url: '/administration', // to set navbar active state
      token: res.locals.token
    });
  });

  /**
   * GET /accountlist
   * JSON accounts api
   */

  app.get('/accountlist', PassportConf.isAuthenticated, PassportConf.isAdministrator, function (req, res) {
    User.model().find({}, function (err, items) {
      if (err) {
        return (err, null);
      }
      res.json(items);
    });
  });

  /**
   * DEL /accountlist/:id
   * JSON accounts delete api
   */

  app.delete('/accountlist/:id', PassportConf.isAuthenticated, PassportConf.isAdministrator, function (req, res) {
    User.model().remove({ _id : req.params.id }, function (err, result) {
      res.send((result === 1) ? { msg: '' } : { msg: 'error: ' + err });
    });
  });

    /**
   * GET /dashboard
   * Render Dashboard Page
   */

  app.get('/colors', PassportConf.isAuthenticated, PassportConf.isAdministrator, function (req, res) {
    res.render('admin/colors', {
      url: '/administration'  // to set navbar active state
    });
  });

};
