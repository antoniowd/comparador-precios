let _webdriver = require('selenium-webdriver')
const fs = require('fs');
const path = require('path');

//bug: cuando el el implicit wait es mayor que cero y este no encuentra el elemento, genera un error de "Session timed out or not found"
_webdriver.WebDriver.prototype.existsElement = function (locator) {
  let _this = this
  return new Promise(function (resolve, reject) {
    return _this.findElement(locator)
      .then(function (elem) {
        return resolve(true)
      })
      .catch(function (err) {
        if (err.name === 'NoSuchElementError')
          return resolve(false)

        return reject(err)
      })
  })
}

_webdriver.WebDriver.prototype.downloadPage = function (name) {
  let _this = this
  return new Promise(function (resolve, reject) {

    return _this.getPageSource()
      .then(function (page) {

        return fs.writeFile(path.join(__dirname, './../pages/' + name + '.html'), page, function (err) {
          if (err) {
            return reject(err)
          }

          return resolve()
        })
      })
      .catch(function (err) {

        return reject(err)
      })
  })
}

module.exports = _webdriver