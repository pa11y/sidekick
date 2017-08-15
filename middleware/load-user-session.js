'use strict';

module.exports = loadUserFromSession;

// This middleware loads the current user and populates
// request and view variables
function loadUserFromSession(dashboard) {
	const User = dashboard.model.User;

	return (request, response, next) => {
		return Promise.resolve()
			.then(() => {
				if (!request.session.userId) {
					return null;
				}
				return User.where({
					id: request.session.userId
				}).fetch();
			})
			.then(user => {
				if (user) {
					user.isLoggedIn = true;
				} else {
					user = User.getDefault();
				}
				request.user = user;
				response.locals.user = user.serialize();
				response.locals.user.isLoggedIn = user.isLoggedIn;
				response.locals.user.isDefaultUser = user.isDefaultUser;
				next();
			})
			.catch(next);
	};
}
