const {Builder, By, Key, until} = require('selenium-webdriver');
 
require('chromedriver');

var path = require('chromedriver').path;


(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml');
    await driver.wait(until.elementLocated(By.name('aceptaOption')), 10000);
    await driver.executeScript(
    	()=>{ el = document.querySelector("#aceptaOption\\:0");
    	el.setAttribute("checked","checked");
    	PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml';}});
    	}
    )
    driver.wait(until.elementLocated(By.name('cedulaInput')), 10000).sendKeys("80076057");

    	
  } finally {
    // await driver.quit();
  }
})();
