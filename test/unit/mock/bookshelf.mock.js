'use strict';

const sinon = require('sinon');

const bookshelf = module.exports = sinon.stub();

const mockInstance = module.exports.mockInstance = {
	isMockBookshelfInstance: true
};

bookshelf.returns(mockInstance);
