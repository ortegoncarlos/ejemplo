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
client.get_balance((balance) => { })

// Declara la funcion que va a hacer todo
let main = async () => {
    // Declara la Variables que se van a usar
    let captcha_resp = {};
    let screen = `${Math.floor(Math.random() * 100000001)}.jpg`;
    // aqui en try va a pasar todo y en catch si se encuentra un error vuelve a empezar
    try {
        await driver.get(CONSTANTS.URL_CONTRALORIA_PERSONA_NATURAL);

        //Digitar cédula
        let cedula = await driver.findElement(By.id('txtNumeroDocumento'))
        cedula.clear()
        cedula.sendKeys(CONSTANTS.TEST_CEDULA)

        //Seleccionar cédula
        driver.findElements(By.css("option")).then(async function (elements) {
            elements.forEach(function (element) {
                element.getText().then(async function (text) {
                    if (text === "Cédula de Ciudadanía") {
                        await element.click();
                    }
                });
            });
        });

        driver.findElements(By.css("iframe")).then(async function (elements) {
            elements.forEach(function (element) {
                element.getAttribute("src").then(async function (text) {
                    console.log(text)
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


