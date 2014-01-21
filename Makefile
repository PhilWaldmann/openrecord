REPORTER = spec

test: test-mocha

test-all: clean test-mocha test-cov

test-mocha:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --recursive

test-cov:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket -R html-cov > coverage.html

test-coveralls:
	./node_modules/.bin/mocha --require blanket --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	
	
clean: 
	rm coverage.html