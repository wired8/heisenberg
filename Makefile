<<<<<<< HEAD
UNIT_TESTS = test/unit
INTEGRATION_TESTS = test/integration
REST_TESTS = test/rest
REPORTER = spec
XML_FILE = reports/unit-test.xml

install:
	cd ngCore; \
		npm install && npm link
	npm install && npm link ngServer

test: unit-test integration-test

full-test: unit-test integration-test rest-test

test-ci:

	@XUNIT_FILE=test/xunit.xml ./node_modules/.bin/mocha \
		$(UNIT_TESTS) \
		--reporter xunit-file \
		--recursive

unit-test:

	@echo "############## UNIT TESTS ################"
	@./node_modules/.bin/mocha \
		$(UNIT_TESTS) \
		--reporter $(REPORTER) \
		--recursive

integration-test:

	@echo "########## INTEGRATION TESTS #############"

	@./node_modules/.bin/mocha \
		$(INTEGRATION_TESTS) \
		--reporter $(REPORTER) \
		--recursive \
		--timeout 999999

rest-test:

	@./rest_tests.sh

test-cov: lib-cov

	@ZOO_COV=1 $(MAKE) unit-test REPORTER=html-cov > test/coverage.html
	@rm -rf app-cov/
	@open test/coverage.html

lib-cov:

	@rm -rf app-cov/
	@jscoverage --no-instrument=models/generated app app-cov

test-lcov: lib-cov

	@ZOO_COV=1 $(MAKE) unit-test REPORTER=mocha-lcov-reporter > test/coverage.lcov
	@rm -rf app-cov/

update-metadata:
	node update-metadata.js


.PHONY: test full-test test-cov integration-test install test-ci test-lcov
=======

PREFIX ?= /usr/local

install: bin/deploy
	@cp -p $< $(PREFIX)/$<

uninstall:
	rm -f $(PREFIX)/bin/deploy

.PHONY: install uninstall
>>>>>>> c0543c317ce3a960dd332e8d7dd7e018915574db
