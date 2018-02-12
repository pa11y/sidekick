'use strict';

const sinon = require('sinon');

const Key = module.exports = sinon.stub();
Key.fetchOneById = sinon.stub();
Key.checkSecret = sinon.stub().resolves(true);

const mockKey = module.exports.mockKey = {
	get: sinon.stub(),
	serialize: sinon.stub()
};

const mockSerializedKey = module.exports.mockSerializedKey = {
	id: 'mock-key-id'
};

Key.returns(mockKey);
mockKey.serialize.returns(mockSerializedKey);
Key.fetchOneById.resolves(mockKey);
