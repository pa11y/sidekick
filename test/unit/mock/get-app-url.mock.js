'use strict';

const sinon = require('sinon');

const getAppUrl = module.exports = sinon.stub();
const mockMiddleware = getAppUrl.mockMiddleware = sinon.stub();

getAppUrl.returns(mockMiddleware);
