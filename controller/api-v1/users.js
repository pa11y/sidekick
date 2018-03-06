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
	const User = dashboard.model.User;

	// Add a param callback for user IDs
	router.param('userId', async (request, response, next, userId) => {
		try {
			request.userFromParam = await User.fetchOneById(userId);
			return next(request.userFromParam ? undefined : httpError(404));
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

}

module.exports = initUsersController;
