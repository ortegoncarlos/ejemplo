require('chromedriver')

/**
 * Declared variables const
 */
const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
const Vision = require('./tools/vision');
let nameScreen = `${ id + new Date() }.jpg`;
let driver = new Builder().forBrowser('chrome').build();

/** call functions **/
run().catch(console.error)

/**
 * function initial
 * @returns {Promise<void>}
 */
async function run () {
    try {
        await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml');
        await driver.wait(until.elementLocated(By.name('aceptaOption')), 1000);
        await driver.executeScript(
            ()=>{
                let el = document.querySelector("#aceptaOption\\:0");
                el.setAttribute("checked","checked");
                PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml'}});
            }
        );
        await completedForm()
    }finally {}
}

/**
 * function per complete form
 * @returns {Promise<void>}
 */
async function completedForm (captchaText = null) {
    try {
        // await driver.wait(until.elementLocated(By.name('cedulaInput')), 1200).sendKeys("80076057")
        await driver.wait(until.elementLocated(By.name('cedulaInput')), 3200).sendKeys('' + id);
        await driver.wait(until.elementLocated(By.id('capimg')), 1200).then(() => {
            driver.executeScript(
                ()=>{
                    let el = document.querySelector(".preloader");
                    el.parentNode.removeChild(el);
                }
            )
        }).then(() => {
            driver.executeScript(
                ()=>{
                    let el = document.getElementById("j_idt20");
                    el.removeAttribute("onclick");
                }
            ).then(
                async function (e) {
                    driver.findElement(By.id('capimg')).takeScreenshot().then(image => {
                        const visionApi = new Vision(image, 'buffer');
                        visionApi.getText().then(e => {
                            console.log(e)
                            /*driver.sleep(1000).then(() => {
                                driver.executeScript("document.getElementById('textcaptcha').value = '"+e+"'");
                            })*/
                            // no entiendo por que si recarga la pagina
                            driver.findElement(By.id('textcaptcha')).sendKeys(e);
                        });
                    })
                }
            )
        });
    } catch (e) {
        console.log(e)
    }

}