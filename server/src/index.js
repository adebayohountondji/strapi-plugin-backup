'use strict';

const bootstrap = require('./bootstrap');
const destroy = require('./destroy');
const config = require('./config/config');
const services = require('./services');

module.exports = () => ({
  bootstrap,
  destroy,
  config,
  services
});
