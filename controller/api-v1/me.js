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

	// Listing and viewing user/keys

	// Get the currently authenticated user
	router.get('/me', requireAuth(), (request, response) => {
		response.send(request.authUser);
	});

	// Get the currently authenticated user's keys
	router.get('/me/keys', requireAuth(), async (request, response, next) => {
		try {
			response.send(await Key.fetchByUserId(request.authUser.id));
		} catch (error) {
			return next(error);
		}
	});

	// Get a single currently authenticated user key by ID
	router.get('/me/keys/:keyId', requireAuth(), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			response.send(key);
		} catch (error) {
			return next(error);
		}
	});


	// Creating keys

	// Create a new key for the currently authenticated user
	router.post('/me/keys', requireAuth(), express.json(), async (request, response, next) => {
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


	// Updating users/keys

	// Update the currently authenticated user
	router.patch('/me', requireAuth(), express.json(), async (request, response, next) => {
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

	// Update a single currently authenticated user key
	router.patch('/me/keys/:keyId', requireAuth(), express.json(), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			await key.update({
				description: request.body.description
			});
			response.status(200).send(key);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a single currently authenticated user key
	router.delete('/me/keys/:keyId', requireAuth(), async (request, response, next) => {
		try {
			if (request.authKey && request.params.keyId === request.authKey.id) {
				return next(httpError(403, 'You are not authorized to delete the key currently being used to authenticate'));
			}
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			await key.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initMeController;
