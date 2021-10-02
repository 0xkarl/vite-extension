RELEASE=$1
echo "release: $RELEASE"
RELEASE=$RELEASE node ./bin/release.js
git add . && git commit -m "release: $RELEASE" && git tag $RELEASE && git push && git push --tags
make build
