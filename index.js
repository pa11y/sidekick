'use strict';

const dotenv = require('dotenv');
const Dashboard = require('./lib/dashboard');
const winston = require('winston');

// Load configurations from an .env file if present
dotenv.config();

// Grab configurations from environment variables
const options = {
	dashboardUrl: process.env.DASHBOARD_URL,
	databaseConnectionString: process.env.DATABASE_URL,
	environment: process.env.NODE_ENV,
	port: process.env.PORT,
	requestLogFormat: process.env.REQUEST_LOG_FORMAT,
	sessionSecret: process.env.SESSION_SECRET
};

// Create a logger to use in the application
options.log = new winston.Logger({
	level: process.env.LOG_LEVEL || (options.environment === 'production' ? 'verbose' : 'debug'),
	transports: [
		new winston.transports.Console({
			showLevel: false
		})
	]
});

// Set up a request logger (should only appear when
// the log level is verbose)
options.requestLogStream = {
	write: message => options.log.verbose(message.trim())
};

// Initialise and start Sidekick
const dashboard = new Dashboard(options);
dashboard.start();
