REPORTER = spec

test: test-mocha

test-all: clean test-mocha test-cov

test-mocha:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --recursive --grep "Collection create a relational record with relation.add"
	# --grep Postgres

test-cov:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive -R html-cov > coverage.html

test-coveralls:
	./node_modules/.bin/mocha --require blanket --recursive --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	
docs:
	node documentation/generate.js
	
clean: 
	rm coverage.html