'use strict';

const sinon = require('sinon');

const resaveBrowserify = module.exports = sinon.stub();

const mockResaver = module.exports.mockResaver = {};

resaveBrowserify.returns(mockResaver);
