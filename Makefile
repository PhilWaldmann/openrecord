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
	git clone git@github.com:PhilWaldmann/openrecord.wiki.git wiki
	./node_modules/.bin/docu --input documentation/Home.md --output wiki/Home.md "./lib/**/*.js" "./examples/**/*.js"
	cp documentation/_Sidebar.md wiki/_Sidebar.md
	cd wiki
	git add -A
	git commit -m 'auto update'
	git push
	cd ..
	rm -rf wiki
	
push-docs: 
	cd documentation/wiki && git add -A && git commit -m 'auto generated update' && git push origin master && cd ../..
	
clean: 
	rm coverage.html