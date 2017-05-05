'use strict';

const sinon = require('sinon');

const express = module.exports = sinon.stub();
express.static = sinon.stub();

const mockAddress = module.exports.mockAddress = {
	port: 1234
};

const mockServer = module.exports.mockServer = {
	address: sinon.stub()
};

const mockApp = module.exports.mockApp = {
	disable: sinon.stub(),
	enable: sinon.stub(),
	engine: sinon.stub(),
	listen: sinon.stub().yieldsAsync(),
	locals: {
		foo: 'bar'
	},
	set: sinon.stub(),
	use: sinon.stub()
};

const mockStaticMiddleware = module.exports.mockStaticMiddleware = sinon.stub();

module.exports.mockRequest = {
	headers: {},
	session: {}
};

module.exports.mockResponse = {
	locals: {
		foo: 'bar'
	},
	render: sinon.stub().yields(),
	send: sinon.stub().returnsThis(),
	set: sinon.stub().returnsThis(),
	status: sinon.stub().returnsThis()
};

mockServer.address.returns(mockAddress);
mockApp.listen.returns(mockServer);
express.static.returns(mockStaticMiddleware);
express.returns(mockApp);
