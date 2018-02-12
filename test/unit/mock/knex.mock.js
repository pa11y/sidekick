'use strict';

const sinon = require('sinon');

const knex = module.exports = sinon.stub();

const mockInstance = module.exports.mockInstance = {
	isMockKnexInstance: true
};

knex.returns(mockInstance);
