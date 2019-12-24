//import {DBC_EMAIL, DBC_KEY, URL_ANTECEDENTES_POLICIA, TEST_CEDULA} from "./constants/globalConstants"
const CONSTANTS = require("./constants/globalConstants");
const { Builder, By, until } = require('selenium-webdriver');

require('chromedriver');
// Crea el chrome
let driver = new Builder().forBrowser('chrome').build();
const antiCaptcha = require('./tools/anticaptcha');
let antiCap = [];

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
                                        const res = await getSolve(e);
                                        console.log("hashsadjdasadhskjdhja")
                                        console.log(res)
                                        console.log("hashsadjdasadhskjdhja")
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
            let webElement = driver.findElement(By.id("g-recaptcha-response"));
            let script = "arguments[0].innerHTML='" + d.solution.gRecaptchaResponse + "'";
            driver.executeScript(script, webElement).then(() => {
                driver.findElement(By.id("btnBuscar")).click();
                //takeScreenShot();
            });
            // return d;
        }
    })
}

function takeScreenShot() {
    driver.sleep(1000).then(() => {
        /*
        driver.findElement(By.css('body > div:nth-child(2) > main > div > div.container-fluid')).takeScreenshot().then(
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