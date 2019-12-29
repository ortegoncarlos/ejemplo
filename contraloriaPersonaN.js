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

async function getSolve(taskId) {
    const res = antiCap.getKeyCaptchaResolved(taskId);
    res.then(d => {
        try {
            if (d.status === 'processing') {
                console.log("Procesando Captcha: ", d)
                getSolve(taskId);
            } else {
                console.log("Captcha Resuelto, JSON respuesta: ", d)
                //Captcha resuelto. Asignarlo en el elemento HTML que lo solicita.
                let webElement = driver.findElement(By.id("g-recaptcha-response"));
                let script = "arguments[0].innerHTML='" + d.solution.gRecaptchaResponse + "'";
                //Permitir que se asigne los valores esperados por el captcha y ejecutar lo de
                //dentro de la función.
                driver.executeScript(script, webElement).then(async function () {
                    //Hacer click en el botón para descargar PDF.
                    await driver.findElement(By.id("btnBuscar")).click().then(() => {
                        setTimeout(async function () {
                            writeTXT(CONSTANTS.TEST_CEDULA);
                            driver.quit()
                            //await writeWithVision(CONSTANTS.TEST_CEDULA)
                        }, 2000);
                    })
                    //takeScreenShot();
                });
            }
        }
        catch (e) {
            console.log("Error al recibir respuesta del CaptchaSolver. Intentar de nuevo.", e)
        }
    })
}

//Escribir en TXT el PDF
async function writeTXT(fileKey) {
    let pdfParser = new PDFParser(this, 1);
    let jsonReport = {};
    await pdfParser.loadPDF(CONSTANTS.DOWNLOADS_PATH_BASE + CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA + CONSTANTS.FOLDER_PATH_SEPARATOR + fileKey + ".pdf");
    await pdfParser.on("pdfParser_dataError", async function (jsonReport) { await console.error(errData.parserError) }
    );
    await pdfParser.on("pdfParser_dataReady", async function (jsonReport) {
        //Remueve todos los saltos de línea del texto:
        let reportText = pdfParser.getRawTextContent().replace(/(\r\n|\n|\r)/gm, " ")
        let actualTimeStamp = Date.now();

        //Si el reporte del usuario consultado es negativo.
        if (reportText.includes("NO SE ENCUENTRA REPORTADO COMO RESPONSABLE FISCAL")) {
            jsonReport = {
                procuraduria: {
                    completed: true,
                    timestamp: actualTimeStamp,
                    alert: null,
                    screen: CONSTANTS.DOWNLOADS_PATH_BASE + CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA + CONSTANTS.FOLDER_PATH_SEPARATOR + fileKey + ".pdf"
                }
            }
        }
        //Si el reporte del usuario consultado es positivo.
        else {
            jsonReport = {
                procuraduria: {
                    completed: true,
                    timestamp: actualTimeStamp,
                    alert: "carcel",
                    screen: CONSTANTS.DOWNLOADS_PATH_BASE + CONSTANTS.DOWNLOADS_PATH_FOLDER_CONTRALORIA + CONSTANTS.FOLDER_PATH_SEPARATOR + fileKey + ".pdf",
                    report: reportText
                }
            }

        }
        console.log("Análisis del reporte: ", jsonReport)
    });
    return jsonReport;
}