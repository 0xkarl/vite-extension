start:
	@npm run $@

build:
	@npm run $@

pack:
	@./node_modules/.bin/web-ext run --source-dir ./dist --target chromium --browser-console --start-url http://localhost:7777/example.html

deploy:
	@rm -rf dist
	@$(MAKE) build
	@surge -d vite-extension.surge.sh dist

.PHONY: \
	start \
	build \
	pack \
	deploy