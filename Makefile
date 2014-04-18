REPORTER = spec

test: test-mocha

test-all: clean test-mocha test-cov

test-mocha:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --recursive

	# --grep Postgres

test-cov:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive -R html-cov > coverage.html

test-coveralls:
	./node_modules/.bin/mocha --require blanket --recursive --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	
docs:
	./node_modules/.bin/docu --output documentation/wiki/Home.md "./lib/**/*.js" "./examples/**/*.js"
	
push-docs: 
	cd documentation/wiki && git add -A && git commit -m 'auto generated update' && git push origin master && cd ../..
	
clean: 
	rm coverage.html