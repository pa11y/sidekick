'use strict';

const sinon = require('sinon');

const nocache = module.exports = sinon.stub();
const mockMiddleware = nocache.mockMiddleware = sinon.stub();

nocache.returns(mockMiddleware);
