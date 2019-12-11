const {Builder, By, Key, until} = require('selenium-webdriver');
 
require('chromedriver');
var path = require('chromedriver').path;
var fs = require('fs');
//Call Cpatcha
dbc = require("deathbycaptcha/deathbycaptcha");
const client = new dbc.SocketClient(username, password);


function solvecaptcha(imagen) {
  var fileimage = fs.readFileSync(imagen)
  console.log('iniciando solvecpathca',fileimage)
  dbc.solve(fileimage, function(err, id, solution) {
    console.log('dbc')
    if(err) return console.error(err); // onoes!
      console.log(solution)
      return solution; 
    });
};


solvecaptcha('./captcha.jpg')

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

    	
//   } finally {
//     // await driver.quit();
//   }
// })();





