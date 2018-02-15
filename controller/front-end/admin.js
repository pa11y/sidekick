'use strict';

const express = require('express');
const httpError = require('http-errors');
const requirePermission = require('../../lib/middleware/require-permission');
const validationError = require('../../lib/util/validation-error');

/**
 * Initialise the admin controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initAdminController(dashboard, router) {
	const User = dashboard.model.User;
	const Setting = dashboard.model.Setting;

	// TODO write integration tests for these routes

	// Redirect the base admin page to the admin users page
	router.get('/admin', requirePermission('admin'), (request, response) => {
		response.redirect('/admin/users');
	});

	// Display the admin users page
	router.get('/admin/users', requirePermission('admin'), async (request, response) => {
		response.render('template/admin/users', {
			users: (await User.fetchAll()).serialize(),
			form: {
				user: {
					created: request.flash.get('form.user.created'),
					deleted: request.flash.get('form.user.deleted')
				}
			}
		});
	});

	// Display the new user page
	router.get('/admin/users/new', requirePermission('admin'), (request, response) => {
		response.render('template/admin/new-user', {
			form: {
				user: {
					allowRead: true
				}
			}
		});
	});

	// Create a new user
	router.post('/admin/users/new', requirePermission('admin'), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Check that the password and confirmation match
			if (request.body.password !== request.body.passwordConfirm) {
				throw validationError('password and confirmed password do not match');
			}

			// Attempt to create a user
			await User.create({
				email: request.body.email,
				password: request.body.password,
				allow_read: request.body.allowRead,
				allow_write: request.body.allowWrite,
				allow_delete: request.body.allowDelete,
				allow_admin: request.body.allowAdmin
			});

			// Redirect back to the main user management page
			request.flash.set('form.user.created', {
				email: request.body.email
			});
			response.redirect('/admin/users');

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/admin/new-user', {
					form: {
						user: {
							email: request.body.email,
							allowRead: request.body.allowRead,
							allowWrite: request.body.allowWrite,
							allowDelete: request.body.allowDelete,
							allowAdmin: request.body.allowAdmin,
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// Display the admin user edit page
	router.get('/admin/users/:userId/edit', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			if (user.get('id') === request.authUser.id) {
				throw httpError(403, 'You are not authorized to modify yourself');
			}
			response.render('template/admin/edit-user', {
				form: {
					user: {
						email: user.get('email'),
						allowRead: user.get('allow_read'),
						allowWrite: user.get('allow_write'),
						allowDelete: user.get('allow_delete'),
						allowAdmin: user.get('allow_admin'),
						success: request.flash.get('form.user.success')
					}
				}
			});
		} catch (error) {
			return next(error);
		}
	});

	// Edit a user
	router.post('/admin/users/:userId/edit', requirePermission('admin'), express.urlencoded({extended: false}), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			if (user.get('id') === request.authUser.id) {
				throw httpError(403, 'You are not authorized to modify yourself');
			}

			// Check that the password and confirmation match
			if (request.body.password && request.body.password !== request.body.passwordConfirm) {
				throw validationError('password and confirmed password do not match');
			}

			// Attempt to update the user
			await user.update({
				email: request.body.email,
				password: request.body.password || undefined,
				allow_read: Boolean(request.body.allowRead),
				allow_write: Boolean(request.body.allowWrite),
				allow_delete: Boolean(request.body.allowDelete),
				allow_admin: Boolean(request.body.allowAdmin)
			});

			// Redirect back to the non-POST version of the page
			request.flash.set('form.user.success', 'Your changes have been saved');
			response.redirect(request.path);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/admin/edit-user', {
					form: {
						user: {
							email: request.body.email,
							allowRead: request.body.allowRead,
							allowWrite: request.body.allowWrite,
							allowDelete: request.body.allowDelete,
							allowAdmin: request.body.allowAdmin,
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// Display the admin user delete page
	router.get('/admin/users/:userId/delete', requirePermission('admin'), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			if (user.get('id') === request.authUser.id) {
				throw httpError(403, 'You are not authorized to modify yourself');
			}
			response.render('template/admin/delete-user', {
				form: {
					user: user.serialize()
				}
			});
		} catch (error) {
			return next(error);
		}
	});

	// Delete a user
	router.post('/admin/users/:userId/delete', requirePermission('admin'), express.urlencoded({extended: false}), async (request, response, next) => {
		try {
			const user = await User.fetchOneById(request.params.userId);
			if (!user) {
				return next();
			}
			if (user.get('is_owner')) {
				throw httpError(403, 'You are not authorized to modify an owner');
			}
			if (user.get('id') === request.authUser.id) {
				throw httpError(403, 'You are not authorized to modify yourself');
			}

			// Attempt to delete the user
			const userEmail = user.get('email');
			await user.destroy();

			// Redirect back to the main user management page
			request.flash.set('form.user.deleted', {
				email: userEmail
			});
			response.redirect('/admin/users');

		} catch (error) {
			return next(error);
		}
	});

	// Display the admin settings page
	router.get('/admin/settings', requirePermission('admin'), async (request, response) => {
		response.render('template/admin/settings', {
			form: {
				settings: {
					publicReadAccess: await Setting.get('publicReadAccess'),
					success: request.flash.get('form.settings.success')
				}
			}
		});
	});

	// Save the admin settings page
	router.post('/admin/settings', requirePermission('admin'), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to set the public access setting
			await Setting.set('publicReadAccess', Boolean(request.body.publicReadAccess));

			// Redirect back to the non-POST version of the page
			request.flash.set('form.settings.success', 'The Sidekick settings have been saved');
			response.redirect(request.path);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/admin/settings', {
					form: {
						user: {
							publicReadAccess: Boolean(request.body.publicReadAccess),
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

}

module.exports = initAdminController;
