//import {DBC_EMAIL, DBC_KEY, URL_ANTECEDENTES_POLICIA, TEST_CEDULA} from "./constants/globalConstants"
const CONSTANTS = require("./constants/globalConstants");
const { Builder, By, Key, until } = require('selenium-webdriver');
const file_path = require('path');

require('chromedriver');
var fs = require('fs');
dbc = require("./deathbycaptcha/deathbycaptcha.js");
const client = new dbc.SocketClient(CONSTANTS.DBC_EMAIL, CONSTANTS.DBC_KEY);
// Crea el chrome
let driver = new Builder().forBrowser('chrome').build();

// Declara la funcion que va a hacer todo
let main = async () => {
    // Declara la Variables que se van a usar
    let captcha_resp = {};
    let screen = `${Math.floor(Math.random() * 100000001)}.jpg`;
    // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
    try {
        await driver.get(CONSTANTS.URL_CONTRALORIA_PERSONA_NATURAL);+

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
                        await driver.switchTo().frame(0);
                        //Hacer Click en el cuadro de intentar captcha
                        await driver.findElement(By.className("recaptcha-checkbox-border")).click()
                        //Volver al parentFrame
                        await driver.switchTo().parentFrame();
                        //Ir al Frame con las imágenes del captcha
                        await driver.switchTo().frame(1);
                        //Esperar a que cargue un elemento de las imágenes
                        await driver.wait(until.elementLocated(By.className('rc-imageselect-payload')), 2000).then(
                            async function () {
                                //Tiempo de espera para cargar imágenes
                                setTimeout(async function () {
                                    let reloadCaptcha = true;
                                    //Ciclo para pedir o no otro recaptcha
                                    while (reloadCaptcha) {
                                        //Esperar a tomar decisión de si pedir o no nuevo recaptcha
                                        await new Promise((resolve, reject) => {
                                            setTimeout(function () {
                                                try {
                                                    //Validar si el captcha no tiene banner.
                                                    driver.findElement(By.className("rc-imageselect-desc-no-canonical")).then((elemento) => {
                                                        elemento.findElements(By.xpath(".//*")).then(function (elements) {
                                                            for (let i = 0; i < elements.length; i++) {

                                                                elements[i].getText().then(function (text) {
                                                                    //Buscar todos los hijos de la descripción del captcha
                                                                    //Si hay un hijo con texto "Verificar" significa que
                                                                    //es un captcha de imágenes recargables - Pedir nuevo captcha.
                                                                    if (text.includes("Verificar")) {
                                                                        //console.log("Con Verificar / Pidiendo Recaptcha")
                                                                        reject("Con Verificar, pedir nuevo captcha")
                                                                    } else {
                                                                        if (i === elements.length - 1) {
                                                                            resolve("Imagen aceptada.")
                                                                        }
                                                                    }
                                                                }, (err) => {
                                                                    //console.log(err)
                                                                    throw ("No se puede obtener texto de los elementos, pedir nuevo captcha");
                                                                })

                                                            }
                                                        })
                                                    }, (err) => {
                                                        //console.log(err)
                                                        reject("La imagen tiene banner, pedir nuevo captcha.");
                                                    });
                                                } catch (err) {
                                                    //console.log(err)
                                                    reject("La imagen no es apta, pedir nuevo captcha")
                                                }
                                            }, 2000);
                                            //
                                        }).then(i => {
                                            console.log("Imagen correcta para descifrar. ");
                                            reloadCaptcha = false;
                                        }).catch(err => {
                                            console.log("Pedir nuevo recapchatcha: ", err)
                                            driver.findElement(By.id('recaptcha-reload-button')).click()
                                        })/*.finally(f => {
                                            console.log("finally: ", reloadCaptcha)
                                        });*/
                                    }
                                    //console.log("EXITO")
                                }, 2000);
                            }
                        )
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


// Errores personalizadas
function ExceptionCaptcha(mensaje) {
    this.mensaje = mensaje;
    this.nombre = "ExceptionCaptcha";
}


