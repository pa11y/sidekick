
# Reusable Makefile
# ------------------------------------------------------------------------
# This section of the Makefile should not be modified, it includes
# commands from my reusable Makefile: https://github.com/rowanmanning/make
-include node_modules/@rowanmanning/make/javascript/index.mk
# [edit below this line]
# ------------------------------------------------------------------------


# Running tasks
# -------------

# Start the application in production mode
start:
	@cross-env NODE_ENV=production node index.js

# Start the application in development mode and auto-restart
# whenever code changes
start-dev:
	@cross-env NODE_ENV=development nodemon -e dust,js,json index.js


# Configuration tasks
# -------------------

# Configure the application for local development
config: .env

# Duplicate the sample environment variable file
.env:
	@echo "Creating .env file from env.sample"
	@cp ./env.sample ./.env;
	@$(TASK_DONE)


# Database tasks
# --------------

# Create the local development database
db-create:
	@psql -c "CREATE DATABASE pa11y_sidekick"
	@$(TASK_DONE)

# Create the local automated testing database
db-create-test:
	@psql -c "CREATE DATABASE pa11y_sidekick_test"
	@$(TASK_DONE)

# Migrate to the latest version of the database schema
db-migrate-up:
	@./script/migrate-up.js
	@$(TASK_DONE)

# Roll back the most recent migration
db-migrate-down:
	@./script/migrate-down.js
	@$(TASK_DONE)

# Seed the database with some demo data
db-seed:
	@./script/seed.js
	@$(TASK_DONE)
