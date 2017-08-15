'use strict';

const bodyParser = require('body-parser');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseFormBody = bodyParser.urlencoded({
		extended: false
	});
	const User = dashboard.model.User;

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
		User.where({
			email: request.body.email
		}).fetch()
			.then(user => {
				if (!user) {
					throw new Error('Incorrect email or password');
				}
				return User.checkPassword(request.body.password, user.get('password')).then(isValid => {
					if (!isValid) {
						throw new Error('Incorrect email or password');
					}
					return user;
				});
			})
			.then(user => {
				request.session.userId = user.get('id');
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
