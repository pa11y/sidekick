'use strict';

const express = require('express');
const requireAuth = require('../../lib/middleware/require-auth');

/**
 * Initialise the settings controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initSettingsController(dashboard, router) {
	const Key = dashboard.model.Key;
	const User = dashboard.model.User;

	// Redirect the base settings page to profile settings
	router.get('/settings', requireAuth(), (request, response) => {
		response.redirect('/settings/profile');
	});

	// Display the profile settings page
	router.get('/settings/profile', requireAuth(), (request, response) => {
		response.render('template/settings/profile', {
			form: {
				user: {
					email: request.authUser.email,
					success: request.flash.get('form.user.success')
				}
			}
		});
	});

	// Save the profile settings page
	router.post('/settings/profile', requireAuth(), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to update the user
			const user = await User.fetchOneById(request.authUser.id);
			await user.update({
				email: request.body.email
			});

			// Redirect back to the non-POST version of the page
			request.flash.set('form.user.success', 'Your profile changes have been saved');
			response.redirect(request.path);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/settings/profile', {
					form: {
						user: {
							email: request.body.email,
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// Display the profile password page
	router.get('/settings/password', requireAuth(), (request, response) => {
		response.render('template/settings/password', {
			form: {
				password: {
					success: request.flash.get('form.password.success')
				}
			}
		});
	});

	// Save the profile password page
	router.post('/settings/password', requireAuth(), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to update the user password
			const user = await User.fetchOneById(request.authUser.id);
			await user.changePassword({
				current: request.body.current,
				next: request.body.next,
				confirm: request.body.confirm
			});

			// Redirect back to the non-POST version of the page
			request.flash.set('form.password.success', 'Your password has been updated');
			response.redirect(request.path);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/settings/password', {
					form: {
						password: {
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// TODO write integration tests for the /settings/keys routes

	// Display the profile API keys page
	router.get('/settings/keys', requireAuth(), async (request, response) => {
		response.render('template/settings/keys', {
			keys: (await Key.fetchByUserId(request.authUser.id)).serialize(),
			form: {
				key: {
					created: request.flash.get('form.key.created'),
					deleted: request.flash.get('form.key.deleted')
				}
			}
		});
	});

	// Display the new API key page
	router.get('/settings/keys/new', requireAuth(), (request, response) => {
		response.render('template/settings/new-key');
	});

	// Generate an API key
	router.post('/settings/keys/new', requireAuth(), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to create a key
			const secret = Key.generateSecret();
			const key = await Key.create({
				user_id: request.authUser.id,
				description: request.body.description,
				secret
			});

			// Redirect back to the main key management page
			request.flash.set('form.key.created', {
				id: key.get('id'),
				secret: secret
			});
			response.redirect('/settings/keys');

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/settings/new-key', {
					form: {
						key: {
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// Display the profile API key edit page
	router.get('/settings/keys/:keyId/edit', requireAuth(), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			response.render('template/settings/edit-key', {
				form: {
					key: {
						description: key.get('description'),
						success: request.flash.get('form.key.success')
					}
				}
			});
		} catch (error) {
			return next(error);
		}
	});

	// Edit an API key
	router.post('/settings/keys/:keyId/edit', requireAuth(), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to update a key
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			await key.update({
				description: request.body.description
			});

			// Redirect back to the main key management page
			request.flash.set('form.key.success', 'Your API key changes have been saved');
			response.redirect(request.path);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/settings/new-key', {
					form: {
						key: {
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

	// Display the profile API key delete page
	router.get('/settings/keys/:keyId/delete', requireAuth(), async (request, response, next) => {
		try {
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			response.render('template/settings/delete-key', {
				form: {
					key: key.serialize()
				}
			});
		} catch (error) {
			return next(error);
		}
	});

	// Delete an API key
	router.post('/settings/keys/:keyId/delete', requireAuth(), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to delete the key
			const key = await Key.fetchOneByIdAndUserId(request.params.keyId, request.authUser.id);
			if (!key) {
				return next();
			}
			const keyDescription = key.get('description');
			await key.destroy();

			// Redirect back to the main key management page
			request.flash.set('form.key.deleted', {
				id: request.params.keyId,
				description: keyDescription
			});
			response.redirect('/settings/keys');

		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initSettingsController;
