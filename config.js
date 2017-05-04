'use strict';

const winston = require('winston');
const dotenv = require('dotenv');

// Load configurations from a .env file if present
dotenv.config({
	silent: true
});

// Create and export the config object
const config = module.exports = {
	database: process.env.DATABASE || process.env.DATABASE_URL,
	environment: process.env.NODE_ENV,
	port: process.env.PORT,
	requestLogFormat: process.env.REQUEST_LOG_FORMAT,
	sessionSecret: process.env.SESSION_SECRET
};

// Get the log level
const environmentBasedLogLevel = (config.environment === 'production' ? 'verbose' : 'debug');
config.logLevel = process.env.LOG_LEVEL || environmentBasedLogLevel;

// Create a logger to use in the application
config.log = new winston.Logger({
	level: config.logLevel,
	transports: [
		new winston.transports.Console({
			showLevel: false
		})
	]
});

// Set up a request logger (should only appear when
// the log level is verbose)
config.log.request = {
	write: message => config.log.verbose(message.trim())
};
