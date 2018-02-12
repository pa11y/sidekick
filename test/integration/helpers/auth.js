'use strict';

// Log into the site
async function login(email, password) {
	await agent
		.post('/login')
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send({
			email,
			password
		})
		.then();
}

module.exports = {
	login: login
};
