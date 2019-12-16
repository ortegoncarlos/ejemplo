const {Builder, By, Key, until} = require('selenium-webdriver');
const file_path = require('path');

require('chromedriver');
// var path = require('chromedriver').path;
var fs = require('fs');
//Call Cpatcha
dbc = require("./deathbycaptcha/deathbycaptcha.js");
const client = new dbc.SocketClient("ortegon.carlos@gmail.com", "nm80vdBUE4OX26gB2UyL");

client.get_balance((balance) => {})

// Crea el chrome
let driver = new Builder().forBrowser('chrome').build();

// Declara funcion de resolver captcha
const solveCaptcha = (imagen, cb) => {
  console.log('iniciando solvecpathca',imagen)  
  client.upload({captcha:imagen,extra: {}}, cb)
};


// Declara la funcion que va a hacer todo
let main = async () =>{
  // Declara la Variables que se van a usar
  let captcha_obj={};
  let screen = `${Math.floor(Math.random() * 100000001)}.jpg`;
  let cpatcha_id = null;
  // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
  try {
    await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml');
    
    await driver.wait(until.elementLocated(By.name('aceptaOption')), 200)
    .then(()=>{
    	driver.executeScript(
	    	()=>{ el = document.querySelector("#aceptaOption\\:0");
	    	el.setAttribute("checked","checked");
	    	PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml';}});
	    	}
    	  )
    })

    await driver.wait(until.elementLocated(By.id('capimg')), 1200)
    .then(()=>{
    	// Ejecutar script en el navegador para quitar el loading
    	driver.executeScript(
	    	()=>{ el = document.querySelector(".preloader");
	    		el.parentNode.removeChild(el);
	    	}
    	  )
    }).then(
    ()=>{
    	// Busca el elemento y le toma un pantallazo.
    	driver.findElement(By.id('capimg')).takeScreenshot()
	    .then(
	    	async function(image, err) {
		    	await solveCaptcha(image,(capthcasolved)=>{console.log('send',capthcasolved);captcha_obj=capthcasolved})
		    })
	    }) 
    let cedula = await driver.findElement(By.name('cedulaInput'))
    cedula.clear()
    cedula.sendKeys("80076057")
    await driver.sleep(15000)
    .then(
    	async ()=>{
    		console.log('before check',captcha_obj)
    		await client.get_captcha(captcha_obj.captcha, (capthcasolved)=>{console.log('response 1',capthcasolved);captcha_obj=capthcasolved})
    	})
    await driver.sleep(1000)
    await driver.findElement(By.id('textcaptcha')).sendKeys(captcha_obj.text)
    await driver.findElement(By.id('j_idt20')).click()
    await driver.wait(until.elementLocated(By.id('form')), 1200)
    .then(
    	 () => {
	    	driver.executeScript(
		    	()=>{ el = document.querySelector(".preloader");
		    		el.parentNode.removeChild(el);
		    	}
	    	  )
	      }
	    )
    await driver.sleep(1000).then(()=>{
		driver.takeScreenshot().then(
			(image, err) => {
		        require('fs').writeFile(screen, image, 'base64', function(err) {
		            console.log(err);
		        });
		    }
		);
    })
	
// TODO arreglar este error
	// let warnmsg = await driver.findElement(By.id('j_idt10'))
 //    driver.wait(warnmsg.elementTextContains('Captcha. El texto ingresado debe corresponder al de la imagen.'), 25000)
 //    .then(()=>{
	
	// 	exception = new ExceptionCaptcha("Captcha no valido");
 //  		throw exception;
    	
 //    })
    setTimeout(async()=>{ await driver.quit()},10000)
	

    

  } catch (error) {
  	// Como paso algo se reinicia
  	console.log("========================ERROR======================",error)
  	main();
  }
  finally {
  	// setTimeout(async()=>{ await driver.quit()},2000)
    
  }
}

(async ()=>{
	await main()
})();


// Errores personalizadas
function ExceptionCaptcha(mensaje) {
   this.mensaje = mensaje;
   this.nombre = "ExceptionCaptcha";
}


