'use strict';

const sinon = require('sinon');

const initModule = module.exports = sinon.stub();
const MockKnexSessionStore = initModule.MockKnexSessionStore = sinon.stub();
const mockSessionStore = initModule.mockSessionStore = sinon.createStubInstance(MockKnexSessionStore);

initModule.returns(MockKnexSessionStore);
MockKnexSessionStore.returns(mockSessionStore);
