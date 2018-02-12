'use strict';

const sinon = require('sinon');

const adaro = module.exports = {
	dust: sinon.stub()
};

const mockRenderer = module.exports.mockRenderer = {};

adaro.dust.returns(mockRenderer);
