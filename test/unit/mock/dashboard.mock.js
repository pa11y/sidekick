'use strict';

const sinon = require('sinon');

const Dashboard = module.exports = sinon.stub();

const mockDashboard = module.exports.mockDashboard = {
	environment: 'production',
	log: require('./log.mock'),
	model: {
		Key: require('./model/key.mock'),
		Setting: require('./model/setting.mock'),
		User: require('./model/user.mock')
	},
	options: {}
};

Dashboard.resolves(mockDashboard);
