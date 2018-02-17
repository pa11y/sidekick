'use strict';

// Log into the site and get a cookie jar
async function getCookieJar(email, password) {
	const jar = request.jar();
	await request.post('/login', {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: `email=${email}&password=${password}`,
		jar
	});
	return jar;
}

module.exports = {
	getCookieJar: getCookieJar
};
