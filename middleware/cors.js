'use strict';

module.exports = cors;

function cors(request, response, next) {
	response.set('Access-Control-Allow-Origin', '*');
	next();
}
