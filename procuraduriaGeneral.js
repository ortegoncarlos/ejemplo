//import {DBC_EMAIL, DBC_KEY, URL_ANTECEDENTES_POLICIA, TEST_CEDULA} from "./constants/globalConstants"
const CONSTANTS = require("./constants/globalConstants");
const { Builder, By, Capabilities } = require('selenium-webdriver');

require('chromedriver');
// Crea el chrome
let chrome = require('selenium-webdriver/chrome');
var driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().setUserPreferences(
        { "download.default_directory": CONSTANTS.DOWNLOADS_PATH_BASE + CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA }
    ))
    .build();

//Crear Anti-captcha
const vision = require('./tools/vision')
const antiCaptcha = require('./tools/anticaptcha');
let antiCap = [];
let PDFParser = require("pdf2json");
let fs = require('fs');

// Declara la funcion que va a hacer todo
let main = async () => {
    // Declara la Variables que se van a usar
    let jsonReport;
    // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
    try {
        await driver.get(CONSTANTS.URL_PROCURADURIA_PERSONA_NATURAL);

            let valido = false;
            let pregunta;
            while(!valido){
                //Valida la pregunta
                await driver.sleep(200).then(async () => {
                    await driver.findElement(By.id("lblPregunta")).then(async function (element) {
                        await element.getText().then(async function (text) {
                            valido = !text.includes("Escriba") && !text.includes("persona");
                            pregunta = text;
                        });
                    });
                })
                if(!valido){
                    await driver.findElement(By.id("ImageButton1")).then(async function (element) {
                        await element.click();
                    });
                }
            }
            await driver.findElement(By.id("ddlTipoID")).then(async function (element) {
                await element.findElement(By.css("option[value='1']")).click();
                await driver.findElement(By.id('txtNumID')).sendKeys(CONSTANTS.TEST_CEDULA);
                let respuesta = await driver.findElement(By.id('txtRespuestaPregunta'));
                if(pregunta.includes(CONSTANTS.PREG_ANTIOQUIA)){
                    await respuesta.sendKeys(CONSTANTS.RESP_ANTIOQUIA);
                } else if(pregunta.includes(CONSTANTS.PREG_COLOMBIA)){
                    await respuesta.sendKeys(CONSTANTS.RESP_COLOMBIA);
                } else if(pregunta.includes(CONSTANTS.PREG_ATLANTICO)){
                    await respuesta.sendKeys(CONSTANTS.RESP_ATLANTICO);
                } else if(pregunta.includes(CONSTANTS.PREG_CAUCA)){
                    await respuesta.sendKeys(CONSTANTS.RESP_CAUCA);
                } else if(pregunta.includes(CONSTANTS.PREG_SUM1)){
                    await respuesta.sendKeys(CONSTANTS.RESP_SUM1);
                } else if(pregunta.includes(CONSTANTS.PREG_RES1)){
                    await respuesta.sendKeys(CONSTANTS.RESP_RES1);
                } else if(pregunta.includes(CONSTANTS.PREG_MULT1)){
                    await respuesta.sendKeys(CONSTANTS.RESP_MULT1);
                } else if(pregunta.includes(CONSTANTS.PREG_MULT2)){
                    await respuesta.sendKeys(CONSTANTS.RESP_MULT2);
                }
                await (await driver.findElement(By.id('btnConsultar'))).click();
                let actualTimeStamp = Date.now();
                let reportText = await driver.findElement(By.className('divSecundario'));

                let elements = reportText.findElements(By.xpath(".//*"));
                let positivo =  false;
                let responseTxt;
                for(let i = 0 ; i < elements.length && !positivo; i++){
                    let valido = elements[i].getText().then(function (text){
                        responseTxt = text;
                        return text.includes("El ciudadano no presenta antecedentes");
                    });
                    if(valido){
                        console.log(responseTxt);
                        positivo = valido;
                    }
                }

                driver.takeScreenshot().then((image, err) => {
                    require('fs').writeFile(CONSTANTS.DOWNLOADS_PATH_FOLDER_PROCURADURIA + CONSTANTS.FOLDER_PATH_SEPARATOR + CONSTANTS.TEST_CEDULA+ ".png", image, 'base64'
                        , function(err) {
                            console.log(err);
                        });
                    }
                );
                if (positivo) {
                    jsonReport = {
                        procuraduria: {
                            completed: true,
                            timestamp: actualTimeStamp,
                            alert: null,
                            screen: CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA + CONSTANTS.FOLDER_PATH_SEPARATOR + CONSTANTS.TEST_CEDULA + ".png",
                            report: responseTxt
                        }
                    }
                }
                else {
                    jsonReport = {
                        procuraduria: {
                            completed: true,
                            timestamp: actualTimeStamp,
                            alert: "carcel",
                            screen: CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA + CONSTANTS.FOLDER_PATH_SEPARATOR + CONSTANTS.TEST_CEDULA + ".png",
                            report: responseTxt
                        }
                    }
        
                }


                
            });
            console.log("Análisis del reporte: ", jsonReport)
    } catch (error) {
        // Como paso algo se reinicia
        console.log("========================ERROR======================", error)
        //main();
    }
    finally {
        // setTimeout(async()=>{ await driver.quit()},2000)

    }
}

(async () => {
    await main()
})();
