'use strict';

const sinon = require('sinon');

const addResponseViewData = module.exports = sinon.stub();
const mockMiddleware = addResponseViewData.mockMiddleware = sinon.stub();

addResponseViewData.returns(mockMiddleware);
