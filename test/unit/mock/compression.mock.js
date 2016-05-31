'use strict';

const sinon = require('sinon');

const compression = module.exports = sinon.stub();
const mockMiddleware = compression.mockMiddleware = sinon.stub();

compression.returns(mockMiddleware);
