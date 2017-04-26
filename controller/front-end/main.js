'use strict';

const httpError = require('http-errors');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	// Home page
	app.get('/', (request, response, next) => {
		model.site.getAll()
			.then(sites => {
				response.locals.sites = sites;
				response.render('index');
			})
			.catch(next);
	});

	// Site page
	app.get('/sites/:siteId', (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				response.locals.site = site;
				return model.url.getAllBySite(site.id);
			})
			.then(urls => {
				response.locals.urls = urls;
				response.render('site');
			})
			.catch(next);
	});

};
