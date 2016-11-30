'use strict';

const allowMethods = require('allow-methods');

// This module exports some prebuilt allow-methods
// middleware functions. This allows API methods to
// respond with correct 405 status codes
module.exports = {
	get: allowMethods(['GET', 'HEAD']),
	post: allowMethods(['POST']),
	getAndPost: allowMethods(['GET', 'HEAD', 'POST'])
};
