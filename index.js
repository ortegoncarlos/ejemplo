const {Builder, By, Key, until} = require('selenium-webdriver');
 
require('chromedriver');

var path = require('chromedriver').path;


(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('http://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('jidsandijnasdipjnasdoijas', Key.RETURN);
    await driver.wait(until.titleIs('jidsandijnasdipjnasdoijas - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
})();