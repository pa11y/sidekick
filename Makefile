include Makefile.node

# Running tasks
# -------------

start:
	@NODE_ENV=production node index.js

start-dev:
	@NODE_ENV=development nodemon -e dust,js,json index.js


# Configuration tasks
# -------------------

config: .env

.env:
	@echo "Creating .env file from env.sample"
	@cp ./env.sample ./.env;
	@$(TASK_DONE)


# Database tasks
# --------------

db-create:
	@psql -c "CREATE DATABASE pa11y_sidekick"
	@$(TASK_DONE)

db-create-test:
	@psql -c "CREATE DATABASE pa11y_sidekick_test"
	@$(TASK_DONE)

db-migrate-up:
	@./script/migrate-up.js
	@$(TASK_DONE)

db-migrate-down:
	@./script/migrate-down.js
	@$(TASK_DONE)

db-seed:
	@./script/seed.js
	@$(TASK_DONE)
