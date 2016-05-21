'use strict';

const httpError = require('http-errors');

module.exports = (request, response, next) => {
	next(httpError(404));
};
