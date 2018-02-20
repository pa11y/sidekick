'use strict';

const express = require('express');
const httpError = require('http-errors');
const requireAuth = require('../../lib/middleware/require-auth');

/**
 * Initialise the "me" controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initMeController(dashboard, router) {
	const Key = dashboard.model.Key;
	const User = dashboard.model.User;

	// Require authentication for all of these routes
	router.use('/me', requireAuth());

	// Add param callback for current user API key IDs
	router.param('myKeyId', async (request, response, next, myKeyId) => {
		try {
			request.keyFromParam = await Key.fetchOneByIdAndUserId(myKeyId, request.authUser.id);
			next(request.keyFromParam ? undefined : httpError(404));
		} catch (error) {
			return next(error);
		}
	});

	// Get the currently authenticated user
	router.get('/me', (request, response) => {
		response.send(request.authUser);
	});

	// Update the currently authenticated user
	router.patch('/me', express.json(), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.authUser.id);
			await user.update({
				email: request.body.email,
				password: request.body.password
			});
			response.status(200).send(user);
		} catch (error) {
			return next(error);
		}
	});

	// List the currently authenticated user's keys
	router.get('/me/keys', async (request, response, next) => {
		try {
			response.send(await Key.fetchByUserId(request.authUser.id));
		} catch (error) {
			return next(error);
		}
	});

	// Create a new key for the currently authenticated user
	router.post('/me/keys', express.json(), async (request, response, next) => {
		try {
			const secret = Key.generateSecret();
			const key = await Key.create({
				user_id: request.authUser.id,
				description: request.body.description,
				secret
			});
			response.status(201).send({
				key: key.get('id'),
				secret
			});
		} catch (error) {
			return next(error);
		}
	});

	// Get a single currently authenticated user key by ID
	router.get('/me/keys/:myKeyId', async (request, response, next) => {
		try {
			const key = request.keyFromParam;
			response.send(key);
		} catch (error) {
			return next(error);
		}
	});

	// Update a single currently authenticated user key
	router.patch('/me/keys/:myKeyId', express.json(), async (request, response, next) => {
		try {
			const key = request.keyFromParam;
			await key.update({
				description: request.body.description
			});
			response.status(200).send(key);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a single currently authenticated user key
	router.delete('/me/keys/:myKeyId', async (request, response, next) => {
		try {
			const key = request.keyFromParam;
			if (request.authKey && key.get('id') === request.authKey.id) {
				return next(httpError(403, 'You are not authorized to delete the key currently being used to authenticate'));
			}
			await key.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initMeController;
