const {Builder, By, Key, until} = require('selenium-webdriver');
const file_path = require('path');

require('chromedriver');
// var path = require('chromedriver').path;
var fs = require('fs');
//Call Cpatcha
dbc = require("./deathbycaptcha/deathbycaptcha.js");
const client = new dbc.SocketClient("ortegon.carlos@gmail.com", "nm80vdBUE4OX26gB2UyL");

client.get_balance((balance) => {})

let driver = new Builder().forBrowser('chrome').build();


const solvecaptcha = (imagen, cb) => {
  console.log('iniciando solvecpathca',imagen)  
  client.upload({captcha:imagen,extra: {}}, cb)
};

// client.get_captcha('77021442',(capthcasolved)=>{console.log('capthcasolved',capthcasolved);captcha_obj=capthcasolved})

let main = async () =>{
  let captcha_obj=null;
  let captcha_screen = `${Math.floor(Math.random() * 100000001)}.jpg`;
  let cpatcha_id = null;
  
  try {
    await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml');
    await driver.sleep(1000)
    await driver.wait(until.elementLocated(By.name('aceptaOption')), 1200)
    .then(()=>{
    	driver.executeScript(
	    	()=>{ el = document.querySelector("#aceptaOption\\:0");
	    	el.setAttribute("checked","checked");
	    	PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml';}});
	    	}
    	  )
    })

    await driver.wait(until.elementLocated(By.name('cedulaInput')), 1200)
    	.sendKeys("80076057")
    await driver.sleep(2000)
    await driver.findElement(By.id('capimg')).takeScreenshot().then(
    	function(image, err) {
    	solvecaptcha(image,(capthcasolved)=>{console.log('send',capthcasolved);captcha_obj=capthcasolved})
    })
    await driver.sleep(15000).then(
    	()=>{client.get_captcha(captcha_obj.captcha,(capthcasolved)=>{console.log('response 1',capthcasolved);captcha_obj=capthcasolved})}
    	)
    await driver.sleep(1000)

    await driver.findElement(By.id('textcaptcha')).sendKeys(captcha_obj.text)
    await driver.findElement(By.id('j_idt20')).click()
    setTimeout(async()=>{ await driver.quit()},10000)
	
	// 	.sendKeys("80076057")
    
    // console.log('1',captcha_obj)
    

  } catch (error) {
  	console.log("======================================ERROR========",error)
  	main();
  }
  finally {
  	// setTimeout(async()=>{ await driver.quit()},2000)
    
  }
}

(async ()=>{
	await main()
})();




