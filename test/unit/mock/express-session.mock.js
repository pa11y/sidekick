'use strict';

const sinon = require('sinon');

const session = module.exports = sinon.stub();
const mockMiddleware = session.mockMiddleware = sinon.stub();

session.returns(mockMiddleware);
