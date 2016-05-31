'use strict';

const httpError = require('http-errors');

module.exports = notFound;

function notFound(request, response, next) {
	next(httpError(404));
}
