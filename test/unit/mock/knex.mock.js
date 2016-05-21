'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const knex = module.exports = sinon.stub();

const mockDatabase = module.exports.mockDatabase = {
	migrate: {
		latest: sinon.stub().resolves(),
		make: sinon.stub().resolves(),
		rollback: sinon.stub().resolves()
	},
	seed: {
		run: sinon.stub().resolves()
	}
};

knex.returns(mockDatabase);
