'use strict';

const express = require('express');
const httpError = require('http-errors');
const requirePermission = require('../../lib/middleware/require-permission');

/**
 * Initialise the URLs controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initUrlsController(dashboard, router) {
	const Url = dashboard.model.Url;

	// Add param callback for URL IDs
	router.param('urlId', async (request, response, next, urlId) => {
		try {
			request.urlFromParam = await Url.fetchOneByIdAndSiteId(urlId, request.params.siteId);
			return next(request.urlFromParam ? undefined : httpError(404));
		} catch (error) {
			return next(error);
		}
	});

	// List a single site's URLs by site ID
	router.get('/sites/:siteId/urls', requirePermission('read'), async (request, response, next) => {
		try {
			const site = request.siteFromParam;
			response.send(await Url.fetchBySiteId(site.get('id')));
		} catch (error) {
			return next(error);
		}
	});

	// Create a new URL for a site
	router.post('/sites/:siteId/urls', requirePermission('write'), express.json(), async (request, response, next) => {
		try {
			const site = request.siteFromParam;
			const url = await Url.create({
				site_id: site.get('id'),
				name: request.body.name,
				address: request.body.address,
				pa11y_config: request.body.pa11yConfig
			});
			response.status(201).send(url);
		} catch (error) {
			return next(error);
		}
	});

	// Get a single site URL by ID
	router.get('/sites/:siteId/urls/:urlId', requirePermission('read'), (request, response, next) => {
		try {
			const url = request.urlFromParam;
			response.send(url);
		} catch (error) {
			return next(error);
		}
	});

	// Update a URL
	router.patch('/sites/:siteId/urls/:urlId', requirePermission('write'), express.json(), async (request, response, next) => {
		try {
			const url = request.urlFromParam;
			await url.update({
				name: request.body.name,
				address: request.body.address,
				pa11y_config: request.body.pa11yConfig
			});
			response.status(200).send(url);
		} catch (error) {
			return next(error);
		}
	});

	// Delete a url
	router.delete('/sites/:siteId/urls/:urlId', requirePermission('delete'), async (request, response, next) => {
		try {
			const url = request.urlFromParam;
			await url.destroy();
			response.status(204).send({});
		} catch (error) {
			return next(error);
		}
	});

}

module.exports = initUrlsController;
