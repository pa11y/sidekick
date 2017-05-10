'use strict';

const sinon = require('sinon');

const disableCache = module.exports = sinon.stub();
const mockMiddleware = disableCache.mockMiddleware = sinon.stub();

disableCache.returns(mockMiddleware);
