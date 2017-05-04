'use strict';

const sinon = require('sinon');

const requireHeader = module.exports = sinon.stub();
const mockMiddleware = requireHeader.mockMiddleware = sinon.stub();

requireHeader.returns(mockMiddleware);
