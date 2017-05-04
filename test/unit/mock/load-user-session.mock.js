'use strict';

const sinon = require('sinon');

const loadUserFromSession = module.exports = sinon.stub();
const mockMiddleware = loadUserFromSession.mockMiddleware = sinon.stub();

loadUserFromSession.returns(mockMiddleware);
