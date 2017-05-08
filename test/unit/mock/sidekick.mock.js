'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const sidekick = module.exports = sinon.stub();

const mockDashboard = module.exports.mockDashboard = {
	environment: 'production',
	log: require('./log.mock'),
	model: {},
	settings: {
		defaultPermissions: {
			allowRead: true,
			allowWrite: true,
			allowDelete: true,
			allowAdmin: true
		}
	}
};

sidekick.resolves(mockDashboard);
