'use strict';

const bodyParser = require('body-parser');
// const httpError = require('http-errors');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseFormBody = bodyParser.urlencoded({
		extended: false
	});

	// Login page
	app.get('/login', (request, response) => {
		response.render('login', {
			formValues: {
				referer: request.query.referer
			}
		});
	});

	// Login page form post
	app.post('/login', parseFormBody, (request, response) => {
		model.user.getByEmailAndPassword(request.body.email, request.body.password)
			.then(user => {
				request.session.userId = user.id;
				response.redirect(request.body.referer || '/');
			})
			.catch(error => {
				response.status(401);
				response.render('login', {
					error: error,
					formValues: request.body
				});
			});
	});

	// Logout page
	app.get('/logout', (request, response) => {
		delete request.session;
		response.redirect('/');
	});

};
