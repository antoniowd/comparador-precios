const config = require('./../config/config')

exports.siteUrl = (url = '') => {
  return config.site_url + url
}