'use strict';

const express = require('express');
const httpError = require('http-errors');
const requirePermission = require('../../lib/middleware/require-permission');

/**
 * Initialise the users controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initUsersController(dashboard, router) {
	const Key = dashboard.model.Key;
	const User = dashboard.model.User;

	// Add a param callback for user IDs
	router.param('userId', async (request, response, next, userId) => {
		try {
			request.userFromParam = await User.fetchOneById(userId);
			next(request.userFromParam ? undefined : httpError(404));
		} catch (error) {
			return next(error);
		}
	});

	// Add param callback for API key IDs
	router.param('keyId', async (request, response, next, keyId) => {
		try {
			request.keyFromParam = await Key.fetchOneByIdAndUserId(keyId, request.params.userId);
			next(request.keyFromParam ? undefined : httpError(404));
		} catch (error) {
			return next(error);
		}
	});

	// List all users
	router.get('/users', requirePermission('admin'), async (request, response, next) => {
		try {
			response.send(await User.fetchAll());
		} catch (error) {
			return next(error);
		}
	});

	// Create a new user
	router.post('/users', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const user = await User.create({
				email: request.body.email,
				password: request.body.password,
				allow_read: request.body.read,
				allow_write: request.body.write,
				allow_delete: request.body.delete,
				allow_admin: request.body.admin
			});
			response.status(201).send(user);
		} catch (error) {
			return next(error);
		}
	});

	// Get a single user by ID
	router.get('/users/:userId', requirePermission('admin'), (request, response, next) => {
		try {
			const user = request.userFromParam;
			response.send(user);
		} catch (error) {
			return next(error);
		}
	});

	// Update a user
	router.patch('/users/:userId', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			await user.update({
				email: request.body.email,
				password: request.body.password,
				allow_read: request.body.read,
				allow_write: request.body.write,
				allow_delete: request.body.delete,
				allow_admin: request.body.admin
			});
			response.status(200).send(user);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a user
	router.delete('/users/:userId', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			if (request.authUser && user.get('id') === request.authUser.id) {
				throw httpError(403, 'You are not authorized to delete yourself');
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			await user.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

	// List a single user's keys by user ID
	router.get('/users/:userId/keys', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			response.send(await Key.fetchByUserId(user.get('id')));
		} catch (error) {
			return next(error);
		}
	});

	// Create a new key for a user
	router.post('/users/:userId/keys', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			const secret = Key.generateSecret();
			const key = await Key.create({
				user_id: user.get('id'),
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

	// Get a single user key by ID
	router.get('/users/:userId/keys/:keyId', requirePermission('admin'), (request, response, next) => {
		try {
			const key = request.keyFromParam;
			response.send(key);
		} catch (error) {
			return next(error);
		}
	});

	// Update a key
	router.patch('/users/:userId/keys/:keyId', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			const key = request.keyFromParam;
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner\'s keys');
			}
			await key.update({
				description: request.body.description
			});
			response.status(200).send(key);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a key
	router.delete('/users/:userId/keys/:keyId', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = request.userFromParam;
			const key = request.keyFromParam;
			if (request.authKey && key.get('id') === request.authKey.id) {
				throw httpError(403, 'You are not authorized to delete the key currently being used to authenticate');
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner\'s keys');
			}
			await key.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initUsersController;
