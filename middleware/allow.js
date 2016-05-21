'use strict';

const allowMethods = require('allow-methods');

module.exports = {
	get: allowMethods(['GET', 'HEAD']),
	post: allowMethods(['POST']),
	getAndPost: allowMethods(['GET', 'HEAD', 'POST'])
};
