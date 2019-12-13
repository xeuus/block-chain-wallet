const ServiceDiscovery = require('./service-discovery');
const {SVD_PORT} = require('./config');
const svd = new ServiceDiscovery(SVD_PORT);
svd.listen();