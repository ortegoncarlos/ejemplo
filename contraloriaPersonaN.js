//import {DBC_EMAIL, DBC_KEY, URL_ANTECEDENTES_POLICIA, TEST_CEDULA} from "./constants/globalConstants"
const CONSTANTS = require("./constants/globalConstants");
const { Builder, By, Capabilities } = require('selenium-webdriver');

require('chromedriver');
// Crea el chrome
let chrome = require('selenium-webdriver/chrome');
var driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().setUserPreferences(
        { "download.default_directory": CONSTANTS.DOWNLOADS_PATH }
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
    // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
    try {
        await driver.get(CONSTANTS.URL_CONTRALORIA_PERSONA_NATURAL); +

            //Seleccionar cédula
            await driver.findElements(By.css("option")).then(async function (elements) {
                await elements.forEach(async function (element) {
                    await element.getText().then(async function (text) {
                        if (text === "Cédula de Ciudadanía") {
                            await element.click();
                            //Digitar cédula
                            let cedula = await driver.findElement(By.id('txtNumeroDocumento'))
                            await cedula.clear()
                            await cedula.sendKeys(CONSTANTS.TEST_CEDULA)
                            //Ir al Frame del Captcha
                            await driver.findElement(By.className('g-recaptcha')).getAttribute('data-sitekey').then((key) => {
                                antiCap = new antiCaptcha('https://cfiscal.contraloria.gov.co/SiborWeb/Certificados/CertificadoPersonaNatural.aspx', key);
                                const taskId = antiCap.createTaskIdApi();
                                taskId.then(e => {
                                    driver.sleep(15000).then(async () => {
                                        //Esperar a que el captcha sea resuelto
                                        const res = await getSolve(e);
                                    });
                                })
                            })
                        }
                    });
                });
            });
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

function getSolve(taskId) {
    const res = antiCap.getKeyCaptchaResolved(taskId);
    res.then(d => {
        console.log(d)
        if (d.status === 'processing') {
            getSolve(taskId);
        } else {
            //Captcha resuelto. Asignarlo en el elemento HTML que lo solicita.
            let webElement = driver.findElement(By.id("g-recaptcha-response"));
            let script = "arguments[0].innerHTML='" + d.solution.gRecaptchaResponse + "'";
            //Permitir que se asigne los valores esperados por el captcha y ejecutar lo de
            //dentro de la función.
            driver.executeScript(script, webElement).then(() => {
                //Hacer click en el botón para descargar PDF.
                driver.findElement(By.id("btnBuscar")).click().then(() => {
                    setTimeout(async function () {
                        await writeJSON(CONSTANTS.TEST_CEDULA);
                        await writeTXT(CONSTANTS.TEST_CEDULA);
                        //await writeWithVision(CONSTANTS.TEST_CEDULA)
                    }, 2000);
                })
                //takeScreenShot();
            });
        }
    })
}

//Escribir en TXT el PDF
function writeJSON(fileKey) {
    let pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
        fs.writeFile("./imgs/contraloriaPersonaN/" + fileKey + ".json", JSON.stringify(pdfData), function (error) {
            if (error != null)
                console.log('Error occured while saving JSON' + error)
        }
        );
    });
    pdfParser.loadPDF("./imgs/contraloriaPersonaN/" + fileKey + ".pdf");
}

//Escribir en TXT el PDF
function writeTXT(fileKey) {
    let pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
        fs.writeFile("./imgs/contraloriaPersonaN/" + fileKey + ".txt", pdfParser.getRawTextContent(), function (error) {
            if (error != null)
                console.log('Error occured while saving TXT' + error)
        }
        );
    });
    pdfParser.loadPDF("./imgs/contraloriaPersonaN/" + fileKey + ".pdf");
}

//VISION no funciona de manera local con PDF. Validar estrategia subiendo a Bucket
//O utilizar otra opción
async function writeWithVision(fileKey) {
    let visionDoc = await new vision('./imgs/contraloriaPersonaN/' + fileKey + '.pdf', 'buffer');
    console.log(await visionDoc.getText())
}


function takeScreenShot() {
    //Tomar Screenshot y guardarlo en la ruta definida en constantes.
    driver.sleep(1000).then(() => {
        /*
        driver.findElement(By.id('PATH_DEL_ELEMENTO_HTML')).takeScreenshot().then(
            (image, err) => {
                fs.writeFile('image/rues/' + nameScreen, image, 'base64', function (error) {
                    if (error != null)
                        console.log('Error occured while saving screenshot' + error)
                })
            }
        )
        */
    })
}