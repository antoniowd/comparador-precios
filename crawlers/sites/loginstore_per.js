let Webdriver = require('../../lib/webdriver-extend'),
  By = Webdriver.By,
  until = Webdriver.until,
  error = Webdriver.error
let cheerio = require('cheerio')

exports.getPrices = function (session, capabilities) {

  return new Promise((resolve, reject) => {

    let run = async function () {
      let driver = null
      try {

        driver = new Webdriver.Builder()
          .usingServer('http://138.68.227.223:4444/wd/hub')
          .withCapabilities(capabilities)
          .build()

        await driver.get(session.url)
        let page = await driver.getPageSource()
        const $ = cheerio.load(page, {decodeEntities: false})

        //scrap the content of the product
        let product = {}
        if ($('span[itemprop="price"]').html() == undefined || $('.in-stock').html() == undefined) {
          return resolve({status: 0, product: product})
        }

        product.description = $('h1[itemprop="name"]').html().trim()
        product.price = $('span[itemprop="price"]').html().trim()
        product.shipping = -1

        await driver.quit()
        return resolve({status: 1, product: product})
      }
      catch (e) {
        await driver.quit()
        return reject(error.encodeError(e))
      }

    }

    return run()

  })

}

