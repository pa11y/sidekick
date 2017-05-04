'use strict';

module.exports = cors;

// This middleware applies CORS headers to the response,
// reducing repetition across all the routes
function cors() {
	return (request, response, next) => {
		response.set('Access-Control-Allow-Origin', '*');
		next();
	};
}
