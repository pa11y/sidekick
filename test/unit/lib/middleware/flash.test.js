'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/middleware/flash', () => {
	let flash;
	let FlashMessenger;

	beforeEach(() => {
		flash = require('../../../../lib/middleware/flash');
		FlashMessenger = flash.FlashMessenger;
	});

	it('exports a function', () => {
		assert.isFunction(flash);
	});

	describe('flash()', () => {
		let middleware;

		beforeEach(() => {
			middleware = flash();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let request;
			let mockFlashMessenger;

			beforeEach(() => {
				mockFlashMessenger = {
					isMockFlashMessenger: true
				};
				flash.FlashMessenger = sinon.stub().returns(mockFlashMessenger);
				request = {
					isMockRequest: true
				};
				next = sinon.spy();
				middleware(request, {}, next);
			});

			it('creates a new FlashMessenger instance and stores it on the request', () => {
				assert.calledOnce(flash.FlashMessenger);
				assert.calledWithNew(flash.FlashMessenger);
				assert.calledWithExactly(flash.FlashMessenger, request);
				assert.strictEqual(request.flash, mockFlashMessenger);
			});

			it('calls `next` with nothing', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

	});

	describe('flash.FlashMessenger', () => {

		it('is a class constructor', () => {
			assert.isFunction(FlashMessenger);
			assert.throws(() => FlashMessenger(), /constructor flashmessenger/i); // eslint-disable-line new-cap
		});

		describe('new flash.FlashMessenger(request)', () => {
			let flash;
			let instance;
			let request;

			beforeEach(() => {
				flash = {
					mockFlash: true
				};
				request = {
					session: {
						flash
					}
				};
				instance = new FlashMessenger(request);
			});

			it('deletes `request.session.flash`', () => {
				assert.isUndefined(request.session.flash);
			});

			describe('.request', () => {

				it('is set to the passed in request', () => {
					assert.strictEqual(instance.request, request);
				});

			});

			describe('.messages', () => {

				it('is set to the session `flash` property', () => {
					assert.strictEqual(instance.messages, flash);
				});

			});

			describe('.get(key)', () => {

				it('returns the value of the given key', () => {
					instance.messages = {
						mockKey: 'mock value'
					};
					assert.strictEqual(instance.get('mockKey'), 'mock value');
				});

				describe('when the given key does not exist', () => {

					it('returns `undefined`', () => {
						instance.messages = {};
						assert.isUndefined(instance.get('mockKey'));
					});

				});

			});

			describe('.set(key, value)', () => {

				it('adds the new key/value to the request session `flash` property', () => {
					delete request.session.flash;
					instance.set('mockKey', 'mock value');
					instance.set('mockKey2', 'mock value 2');
					assert.isObject(request.session.flash);
					assert.strictEqual(request.session.flash.mockKey, 'mock value');
					assert.strictEqual(request.session.flash.mockKey2, 'mock value 2');
				});

			});

			describe('when `request.session.flash` is not defined', () => {

				beforeEach(() => {
					request = {
						session: {}
					};
					instance = new FlashMessenger(request);
				});

				describe('.messages', () => {

					it('is set to the an empty object', () => {
						assert.deepEqual(instance.messages, {});
					});

				});

			});

		});

	});

});
