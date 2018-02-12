'use strict';

const sinon = require('sinon');

const bindLogger = module.exports = sinon.stub();

const mockLogger = module.exports.mockLogger = {
	error: sinon.spy(),
	info: sinon.spy()
};

bindLogger.returns(mockLogger);
