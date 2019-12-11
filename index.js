const {Builder, By, Key, until} = require('selenium-webdriver');
 
require('chromedriver');
var path = require('chromedriver').path;
var fs = require('fs');
//Call Cpatcha
dbc = require("./deathbycaptcha/deathbycaptcha.js");
const client = new dbc.SocketClient("ortegon.carlos@gmail.com", "nm80vdBUE4OX26gB2UyL");

client.get_balance((balance) => {console.log(balance)})



function solvecaptcha(imagen) {
  console.log('iniciando solvecpathca')
  client.upload({captcha:imagen,extra: {}}, (captcha) => {console.log(captcha)})
};



solvecaptcha('./captcha.jpg')


// client.get_captcha(1407421268, (captcha) => {console.log(captcha)})

// (async function example() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml');
//     await driver.wait(until.elementLocated(By.name('aceptaOption')), 10000);
//     await driver.executeScript(
//     	()=>{ el = document.querySelector("#aceptaOption\\:0");
//     	el.setAttribute("checked","checked");
//     	PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml';}});
//     	}
//     )
//     driver.wait(until.elementLocated(By.name('cedulaInput')), 10000).sendKeys("80076057");
//     // var captcha_obj = solvecaptcha('./captcha.jpg')


    	
//   } finally {
//     // await driver.quit();
//   }
// })();





