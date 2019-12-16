const {Builder, By, Key, until} = require('selenium-webdriver');
const file_path = require('path');

require('chromedriver');
// var path = require('chromedriver').path;
var fs = require('fs');

// Crea el chrome
let driver = new Builder().forBrowser('chrome').build();

// Declara la funcion que va a hacer todo
let main = async () =>{
  // Declara la Variables que se van a usar
  let cedulainput = "19304877"
  let screen = `${Math.floor(Math.random() * 100000001)}-${cedulainput}.jpg`;

  // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
  try {
    await driver.get('https://consulta.simit.org.co/Simit/verificar/contenido_verificar_pago_linea.jsp');
    await driver.sleep(500)
    await driver.wait(until.elementLocated(By.id('txtInput')), 200)
    .then(()=>{
    	driver.executeScript(
	    	()=>{
        let x = document.getElementById("txtCaptcha").value
        let y = x.replace(/\s/g,'')
        document.getElementById("txtInput").value = y
	    	}
    	  )
    })

    let cedula = await driver.findElement(By.id('identificacion'))
    cedula.clear()
    cedula.sendKeys(cedulainput)
    .then(()=>{
      driver.executeScript(
        ()=>{
          enviar('N')
        }
        )
    })
    await driver.sleep(500)
    await driver.wait(until.urlIs('https://consulta.simit.org.co/Simit/verificar/detalleConsultaEstadoCuenta.jsp?mensajeVerificarRetencion=S'),1000)
    .then(()=>{
  		driver.takeScreenshot().then(
  			(image, err) => {
  		        require('fs').writeFile(screen, image, 'base64', function(err) {
  		            console.log(err);
  		        });
  		    }
  		);
    })
	

    setTimeout(async()=>{ await driver.quit()},3000)
	

    

  } catch (error) {
  	// Como paso algo se reinicia
  	console.log("========================ERROR======================",error)
  	// main();
  }
  finally {
  	// setTimeout(async()=>{ await driver.quit()},2000)
    
  }
}

(async ()=>{
	await main()
})();



