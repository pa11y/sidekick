'use strict';

const express = require('express');
// const httpError = require('http-errors');
const requirePermission = require('../../lib/middleware/require-permission');

/**
 * Initialise the sites controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initSitesController(dashboard, router) {
	const Site = dashboard.model.Site;

	// Get a list of all sites
	router.get('/sites', requirePermission('read'), async (request, response, next) => {
		try {
			response.send(await Site.fetchAll());
		} catch (error) {
			return next(error);
		}
	});

	// Create a new site
	router.post('/sites', requirePermission('write'), express.json(), async (request, response, next) => {
		try {
			const site = await Site.create({
				name: request.body.name,
				base_url: request.body.baseUrl,
				is_runnable: request.body.isRunnable,
				is_scheduled: request.body.isScheduled,
				schedule: request.body.schedule,
				pa11y_config: request.body.pa11yConfig
			});
			response.status(201).send(site);
		} catch (error) {
			return next(error);
		}
	});

	// Get a single site by ID
	router.get('/sites/:siteId', requirePermission('read'), async (request, response, next) => {
		try {
			const site = await Site.fetchOneById(request.params.siteId);
			if (!site) {
				return next();
			}
			response.send(site);
		} catch (error) {
			return next(error);
		}
	});

	// Update a site by ID
	router.patch('/sites/:siteId', requirePermission('write'), express.json(), async (request, response, next) => {
		try {
			const site = await Site.fetchOneById(request.params.siteId);
			if (!site) {
				return next();
			}
			await site.update({
				name: request.body.name,
				base_url: request.body.baseUrl,
				is_runnable: request.body.isRunnable,
				is_scheduled: request.body.isScheduled,
				schedule: request.body.schedule,
				pa11y_config: request.body.pa11yConfig
			});
			response.status(200).send(site);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a site by ID
	router.delete('/sites/:siteId', requirePermission('delete'), async (request, response, next) => {
		try {
			const site = await Site.fetchOneById(request.params.siteId);
			if (!site) {
				return next();
			}
			await site.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initSitesController;
