'use strict';

const sinon = require('sinon');

const cors = module.exports = sinon.stub();
const mockMiddleware = cors.mockMiddleware = sinon.stub();

cors.returns(mockMiddleware);
