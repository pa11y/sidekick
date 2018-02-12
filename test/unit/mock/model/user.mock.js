'use strict';

const sinon = require('sinon');

const User = module.exports = sinon.stub();
User.fetchOneById = sinon.stub();

const mockUser = module.exports.mockUser = {
	get: sinon.stub(),
	serialize: sinon.stub()
};

const mockSerializedUser = module.exports.mockSerializedUser = {
	id: 'mock-user-id',
	permissions: {
		read: true,
		write: true,
		delete: false,
		admin: false
	}
};

User.returns(mockUser);
mockUser.serialize.returns(mockSerializedUser);
User.fetchOneById.resolves(mockUser);
