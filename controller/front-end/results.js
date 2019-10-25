'use strict';

const express = require('express');
const requirePermission = require('../../lib/middleware/require-permission');

/**
 * Initialise the sites controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initResultsController(dashboard, router) {
	const Site = dashboard.model.Site;

	// TODO write integration tests for these routes

	// List of all sites
	router.get('/results', requirePermission('read'), async (request, response) => {
		response.render('template/results/results', {
			sites: (await Site.fetchAll()).serialize()
		});
	});

	// Get a single site
	router.get('/sites/:siteId', requirePermission('read'), async (request, response, next) => {
		try {
			const site = await Site.fetchOneById(request.params.siteId);
			if (!site) {
				return next();
			}
			response.render('template/sites/site', {
				site: site.serialize(),
				form: {
					site: {
						created: request.flash.get('form.site.created')
					}
				}
			});
		} catch (error) {
			return next(error);
		}
	});

	// Display the new site page
	router.get('/sites/new', requirePermission('write'), (request, response) => {
		response.render('template/sites/new-site', {
			form: {
				site: {}
			}
		});
	});

	// Create a new site
	router.post('/sites/new', requirePermission('write'), express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// TODO check Pa11y config for JSON errors
			// and pass into the create method

			// Attempt to create a site
			const site = await Site.create({
				name: request.body.name,
				base_url: request.body.baseUrl,
				is_runnable: request.body.isRunnable,
				is_scheduled: request.body.isScheduled,
				schedule: request.body.schedule
			});

			// Redirect to the site page
			request.flash.set('form.site.created', {
				name: request.body.name
			});
			response.redirect(`/sites/${site.get('id')}`);

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/sites/new-site', {
					form: {
						site: {
							name: request.body.name,
							baseUrl: request.body.baseUrl,
							isRunnable: request.body.isRunnable,
							isScheduled: request.body.isScheduled,
							schedule: request.body.schedule,
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

}

module.exports = initResultsController;
