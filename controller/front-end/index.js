'use strict';

const authWithCookie = require('../../lib/middleware/auth-with-cookie');
const express = require('express');
const flash = require('../../lib/middleware/flash');
const initAdminController = require('./admin');
const initAuthController = require('./auth');
const initDocsController = require('./docs');
const initHomeController = require('./home');
const initSettingsController = require('./settings');
const initSetupController = require('./setup');
const notFound = require('../../lib/middleware/not-found');
const session = require('express-session');
const SessionStore = require('connect-session-knex')(session);
const uuid = require('uuid/v4');

/**
 * Initialise the Front End controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Object} An Express router.
 */
function initFrontEndController(dashboard) {

	// Create an Express router for the front end
	const router = new express.Router({
		caseSensitive: true,
		strict: true
	});

	// Serve static files
	router.use(express.static(`${__dirname}/../../public`));

	// Set up session middleware, backed by the database
	router.use(session({
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
		},
		name: 'sidekick.sid',
		resave: false,
		saveUninitialized: false,
		secret: dashboard.options.sessionSecret || uuid(),
		store: new SessionStore({
			knex: dashboard.database.knex,
			createtable: false
		}),
		unset: 'destroy'
	}));

	// Set up flash messaging
	router.use(flash());

	// Allow authentication through a session cookie
	router.use(authWithCookie());

	// Add default view data
	router.use((request, response, next) => {
		response.locals.siteWideAlert = request.flash.get('site-wide-alert');
		response.locals.appUrl = request.appUrl;
		response.locals.authUser = request.authUser;
		response.locals.permissions = request.permissions;
		response.locals.requestPath = request.path;
		response.locals.requestUrl = request.url;
		next();
	});

	// Mount routes
	// IMPORTANT: the setup controller MUST be mounted before the home controller
	initSetupController(dashboard, router);
	initHomeController(dashboard, router);
	initAuthController(dashboard, router);
	initDocsController(dashboard, router);
	initSettingsController(dashboard, router);
	initAdminController(dashboard, router);

	// Middleware to handle errors
	router.use(notFound());
	router.use((error, request, response, next) => { // eslint-disable-line no-unused-vars

		// The status code should be a client or server error
		const statusCode = (error.status && error.status >= 400 ? error.status : 500);

		// Render a helpful error page
		response.status(statusCode).render('template/error', {
			error: {
				status: statusCode,
				message: error.message,
				stack: (dashboard.environment === 'development' ? error.stack : undefined)
			}
		});

		// Output server errors in the logs – we need
		// to know about these
		if (error.status >= 500) {
			dashboard.log.error(error.stack);
		}

	});

	return router;
}

module.exports = initFrontEndController;
