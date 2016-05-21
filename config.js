'use strict';

module.exports = {
	database: process.env.DATABASE || process.env.DATABASE_URL,
	environment: process.env.NODE_ENV || 'development',
	log: console,
	port: process.env.PORT
};
