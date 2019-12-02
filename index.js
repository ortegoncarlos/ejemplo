const {Builder, By, Key, until} = require('selenium-webdriver');
 
require('chromedriver');

var path = require('chromedriver').path;


(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/antecedentes.xhtml');
    await driver.findElement(By.name('cedulaInput')).sendKeys('80076057');
    // await driver.wait(until.titleIs('jidsandijnasdipjnasdoijas - Google Search'), 1000);
  } finally {
    // await driver.quit();
  }
})();