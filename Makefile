o?=$(o)

start:
	@webpack -c -w

example:
	@webpack-dev-server --inline --watch --hot --colors -d --port 7777

build:
	@rm -rf dist tmp
	@mkdir tmp
	@webpack -c --mode production
	@cp -r dist tmp/vite-extension
	@cd tmp/vite-extension && zip -x *.DS_Store -r ../vite-extension.zip *
	@surge -d vite-extension.surge.sh dist

deploy:
	@$(MAKE) build

deploy-docs:
	@$(MAKE) deploy -C docs

pack:
	@./node_modules/.bin/web-ext run --source-dir ./dist --target chromium --browser-console --start-url http://localhost:7777/example.html

release:
	@./bin/release.sh $o

.PHONY: \
	start \
	build \
	pack \
	deploy \
	deploy-docs \
	release \
	example
