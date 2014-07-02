REPORTER = spec

test: test-mocha

test-all: clean test-mocha test-cov

test-mocha:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --recursive

test-cov:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive -R html-cov > coverage.html

test-coveralls:
	./node_modules/.bin/mocha --require blanket --recursive --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	
docs:
	rm -rf wiki
	git clone git@github.com:PhilWaldmann/openrecord.wiki.git wiki
	./node_modules/.bin/docu --input documentation/Home.md --output wiki/Home.md "./lib/**/*.js" "./examples/**/*.js"
	cp documentation/_Sidebar.md wiki/_Sidebar.md
	
push-docs: 
	git -C wiki/ add -A
	git -C wiki/ commit -m 'auto update'
	git -C wiki/ push
	rm -rf wiki
	
clean: 
	rm coverage.html