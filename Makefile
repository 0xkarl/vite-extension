o?=$(o)

start:
	@npm run $@

build:
	@rm -rf dist tmp
	@mkdir tmp
	@npm run $@
	@cp -r dist tmp
	@zip -x *.DS_Store -r tmp/vite-extension.zip tmp/dist
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
