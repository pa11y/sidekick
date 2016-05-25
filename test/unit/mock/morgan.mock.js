'use strict';

const sinon = require('sinon');

const morgan = module.exports = sinon.stub();
const mockMiddleware = morgan.mockMiddleware = sinon.stub();

morgan.returns(mockMiddleware);
