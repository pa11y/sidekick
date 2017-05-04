'use strict';

const sinon = require('sinon');

const loadUserFromApiKey = module.exports = sinon.stub();
const mockMiddleware = loadUserFromApiKey.mockMiddleware = sinon.stub();

loadUserFromApiKey.returns(mockMiddleware);
