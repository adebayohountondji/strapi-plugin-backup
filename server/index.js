'use strict';

const bootstrap = require('./lifecycle/bootstrap');
const destroy = require('./lifecycle/destroy');
const config = require('./configuration/config');
const services = require('./backend/services');

module.exports = () => ({
  bootstrap,
  destroy,
  config,
  services
});
