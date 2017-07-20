'use strict';

const sinon = require('sinon');

const bookshelf = module.exports = sinon.stub();

const mockDatabase = module.exports.mockDatabase = {
	knex: require('./knex.mock').mockDatabase,
	plugin: sinon.spy()
};

bookshelf.returns(mockDatabase);
