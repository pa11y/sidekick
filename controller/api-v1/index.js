'use strict';

const authWithKey = require('../../lib/middleware/auth-with-key');
const express = require('express');
const initDocsController = require('./docs');
const initMeController = require('./me');
const initUsersController = require('./users');
const notFound = require('../../lib/middleware/not-found');

/**
 * Initialise the V1 API controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Object} An Express router.
 */
function initApiV1Contoller(dashboard) {

	// Create an Express router for the V1 API
	const router = new express.Router({
		caseSensitive: true,
		strict: true
	});

	// Set permissive CORS headers for the API
	router.use((request, response, next) => {
		response.set({
			'Access-Control-Allow-Headers': 'X-Api-Key, X-Api-Secret',
			'Access-Control-Allow-Methods': 'DELETE, GET, HEAD, POST, PATCH',
			'Access-Control-Allow-Origin': '*'
		});
		next();
	});

	// Allow authentication through an API key/secret pair
	router.use(authWithKey());

	// Mount routes
	initDocsController(dashboard, router);
	initUsersController(dashboard, router);
	initMeController(dashboard, router);

	// Middleware to handle errors
	router.use(notFound());
	router.use((error, request, response, next) => { // eslint-disable-line no-unused-vars

		// The status code should be a client or server error
		let statusCode = (error.status && error.status >= 400 ? error.status : 500);

		// Handle Joi validation errors differently
		let validationDetails;
		if (error.name === 'ValidationError') {
			statusCode = (statusCode < 500 ? statusCode : 400);
			error.message = 'Validation failed';
			validationDetails = error.details.map(detail => detail.message);
		}

		// Output helpful error information as JSON
		response.status(statusCode).send({
			status: statusCode,
			message: error.message,
			validation: validationDetails,
			stack: (dashboard.environment === 'development' ? error.stack : undefined)
		});

		// Output server errors in the logs – we need
		// to know about these
		if (error.status >= 500) {
			dashboard.log.error(error.stack);
		}

	});

	return router;
}

module.exports = initApiV1Contoller;
