'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

const sidekick = module.exports = sinon.stub();

const mockDashboard = module.exports.mockDashboard = {
	environment: 'production',
	log: require('./log.mock')
};

sidekick.resolves(mockDashboard);
