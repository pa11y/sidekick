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


	// Listing and viewing users/keys

	// Get a list of all users
	router.get('/users', requirePermission('admin'), async (request, response, next) => {
		try {
			response.send(await User.fetchAll());
		} catch (error) {
			return next(error);
		}
	});

	// Get a single user by ID
	router.get('/users/:userId', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			response.send(user);
		} catch (error) {
			return next(error);
		}
	});

	// Get a single user's keys by user ID
	router.get('/users/:userId/keys', requirePermission('admin'), async (request, response, next) => {
		try {
			const userExists = await User.existsById(request.params.userId);
			if (!userExists) {
				return next();
			}
			response.send(await Key.fetchByUserId(request.params.userId));
		} catch (error) {
			return next(error);
		}
	});

	// Get a single user key by ID
	router.get('/users/:userId/keys/:keyId', requirePermission('admin'), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.params.userId);
			if (!key) {
				return next();
			}
			response.send(key);
		} catch (error) {
			return next(error);
		}
	});


	// Creating users/keys

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

	// Create a new key for a user
	router.post('/users/:userId/keys', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const userExists = await User.existsById(request.params.userId);
			if (!userExists) {
				return next();
			}
			const secret = Key.generateSecret();
			const key = await Key.create({
				user_id: request.params.userId,
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

	// Update a user
	router.patch('/users/:userId', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				return next(httpError(403, 'You are not authorized to modify an owner'));
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

	// Update a key
	router.patch('/users/:userId/keys/:keyId', requirePermission('admin'), express.json(), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.params.userId);
			if (!key) {
				return next();
			}
			if (key.related('user').get('is_owner')) {
				return next(httpError(403, 'You are not authorized to modify an owner\'s keys'));
			}
			await key.update({
				description: request.body.description
			});
			response.status(200).send(key);
		} catch (error) {
			return next(error);
		}
	});


	// Deleting users/keys

	// Delete a user
	router.delete('/users/:userId', requirePermission('admin'), async (request, response, next) => {
		try {
			if (request.authUser && request.params.userId === request.authUser.id) {
				return next(httpError(403, 'You are not authorized to delete yourself'));
			}
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				return next(httpError(403, 'You are not authorized to modify an owner'));
			}
			await user.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

	// Delete a key
	router.delete('/users/:userId/keys/:keyId', requirePermission('admin'), async (request, response, next) => {
		try {
			if (request.authKey && request.params.keyId === request.authKey.id) {
				return next(httpError(403, 'You are not authorized to delete the key currently being used to authenticate'));
			}
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.params.userId);
			if (!key) {
				return next();
			}
			if (key.related('user').get('is_owner')) {
				return next(httpError(403, 'You are not authorized to modify an owner\'s keys'));
			}
			await key.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initUsersController;
