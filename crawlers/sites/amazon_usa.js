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

        await driver.wait(async function () {
          await driver.sleep(1000)
          let state = await driver.executeScript('return document.readyState;')
          return state === 'complete'
        }, 10000, 'No se ha podido cargar los js de la pagina')

        if (!await driver.existsElement(By.id('priceblock_ourprice'))) {
          await driver.quit()
          return resolve({status: 0, product: {}})
        }

        await driver.manage().setTimeouts({implicit: 60000})

        await driver.findElement(By.id('glow-ingress-line1')).click()

        await driver.wait(until.elementLocated(By.id('GLUXCountryListDropdown')), 20000)

        await driver.findElement(By.id('GLUXCountryListDropdown')).click()

        await driver.findElement(By.id('GLUXCountryList_179')).click()

        await driver.findElement(By.css('div.a-popover-footer span.a-declarative span.a-button.a-button-primary span.a-button-inner button.a-button-text')).click()

        await driver.wait(until.elementLocated(By.id('priceblock_ourprice')), 15000)
        await driver.wait(async function () {
          await driver.sleep(1000)
          let state = await driver.executeScript('return document.readyState;')
          return state === 'complete'
        }, 10000, 'No se ha podido cargar los js de la pagina')

        if (!await driver.existsElement(By.id('priceblock_ourprice'))) {
          await driver.quit()
          return resolve({status: 0, product: {}})
        }

        let page = await driver.getPageSource()
        const $ = cheerio.load(page, {decodeEntities: false})

        //scrap the content of the product
        let product = {}
        product.description = $('#productTitle').html().trim()
        product.price = $('#priceblock_ourprice').html().trim().replace(/[^0-9|.]/g, '')

        //shipping cost
        let shippingmessage = $('#ourprice_shippingmessage > span.a-size-base').html()
        if (shippingmessage != null)
          shippingmessage = shippingmessage.trim()
        else {
          await driver.quit()
          product.shipping = -1
          return resolve({status: 0, product: product})
        }

        if (shippingmessage.indexOf('GRATIS') > 0 || shippingmessage.indexOf('GRATUITO') > 0) {
          product.shipping = 0
        }
        else {
          if (shippingmessage == '') {
            product.shipping = -1
          }
          else {
            product.shipping = shippingmessage.replace(/[^0-9|.]/g, '')
            product.shipping = product.shipping != '' ? product.shipping : 0
          }
        }

        await driver.quit()
        return resolve({status: (product.shipping == -1 ? 0 : 1), product: product})
      }
      catch (e) {
        return reject(error.encodeError(e))
      }

    }

    return run()

  })

}

