'use strict';

const sinon = require('sinon');

const morgan = module.exports = sinon.stub();
const mockMiddleware = morgan.mockMiddleware = sinon.stub();

morgan.token = sinon.stub();
morgan.combined = 'mock-morgan-combined-format';

morgan.returns(mockMiddleware);
