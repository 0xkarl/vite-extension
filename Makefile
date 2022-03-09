o?=$(o)

start:
	@npm run $@

build:
	@rm -rf dist tmp
	@mkdir tmp
	@npm run $@
	@cp -r dist tmp/vite-extension
	@cd tmp/vite-extension && zip -x *.DS_Store -r ../vite-extension.zip *
	@surge -d vite-extension.surge.sh dist

deploy:
	@$(MAKE) build

pack:
	@./node_modules/.bin/web-ext run --source-dir ./dist --target chromium --browser-console --start-url http://localhost:7777/example.html

release:
	@./bin/release.sh $o

.PHONY: \
	start \
	build \
	pack \
	deploy \
	release
