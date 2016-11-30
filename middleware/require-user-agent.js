'use strict';

const requireHeader = require('require-header');

// This module exports some prebuilt require-header
// middleware functions. This allows API methods to
// respond with correct 400 status codes when
// required headers aren't satisfied
module.exports = requireHeader('User-Agent');
