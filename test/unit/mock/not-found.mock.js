'use strict';

const sinon = require('sinon');

const notFound = module.exports = sinon.stub();
const mockMiddleware = notFound.mockMiddleware = sinon.stub();

notFound.returns(mockMiddleware);
