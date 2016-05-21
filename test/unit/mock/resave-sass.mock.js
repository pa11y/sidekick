'use strict';

const sinon = require('sinon');

const resaveSass = module.exports = sinon.stub();

const mockResaver = module.exports.mockResaver = {};

resaveSass.returns(mockResaver);
