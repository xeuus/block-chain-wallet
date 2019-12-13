export NODE_ENV=production
export APP=*:4000
dev:
	. ./.env && NODE_ENV=development PORT=4000 npm run watch
srv:
	. ./.env && npm run srv
svd:
	. ./.env && npm run svd
p2p:
	. ./.env && npm run p2p
gw:
	. ./.env && npm run gw
run:
	npm run start
build:
	npm run bundle
