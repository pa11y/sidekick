'use strict';

const sinon = require('sinon');

module.exports = {
	debug: sinon.spy(),
	error: sinon.spy(),
	info: sinon.spy(),
	request: {
		write: sinon.spy()
	},
	verbose: sinon.spy(),
	warn: sinon.spy()
};
