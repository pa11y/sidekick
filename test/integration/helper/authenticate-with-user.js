/* global agent */
'use strict';

module.exports = authenticateWithUser;

// This helper function adds a session for the given
// user and returns the session cookie
function authenticateWithUser(email, password) {
	return new Promise((resolve, reject) => {
		let cookie;
		agent
			.post('/login')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send({
				email,
				password
			})
			.expect(response => {
				cookie = response.headers['set-cookie'][0].split(';')[0];
			})
			.end(error => {
				if (error) {
					return reject(error);
				}
				resolve(cookie);
			});
	});
}
