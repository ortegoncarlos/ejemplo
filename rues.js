require('chromedriver')

/**
 * nit example 901082646
 * Declared variables const
 */
const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
const antiCaptcha = require('./tools/anticaptcha');
let nameScreen = `${ id + ' - ' + new Date().toDateString() }.jpg`;
let driver = new Builder().forBrowser('chrome').build();
let antiCap = [];


/** call functions **/
run().catch(console.error);

/**
 * function initial
 * @returns {Promise<void>}
 */
async function run() {
    try {
        await driver.get('https://www.rues.org.co/');
        let nit  = await driver.wait(until.elementLocated(By.id('NIT')), 1000);
        nit.sendKeys(id);
        await driver.findElement(By.id('btnConsultaNIT')).click();

        await driver.wait(until.elementLocated(By.css('#captchaPanel > form > div.g-recaptcha')), 10000);
        await driver.findElement(By.css('#captchaPanel > form > div.g-recaptcha')).getAttribute('data-sitekey').then((key) => {
            antiCap = new antiCaptcha('https://www.rues.org.co/Expediente', key);
            const taskId = antiCap.createTaskIdApi();
            taskId.then(e => {
                driver.sleep(15000).then(async () => {
                    const res = await getSolve(e);
                });
            })
        })
    } finally {}
};

/**
 * Send request to solve taskId
 * @param taskId
 */
async function getSolve (taskId) {
    const res = antiCap.getKeyCaptchaResolved(taskId);
    await res.then(d => {
        console.log(d)
        if (d.status === 'processing') {
            getSolve(taskId);
        } else {
            let webElement = driver.findElement(By.id("g-recaptcha-response"));
            let script = "arguments[0].innerHTML='" + d.solution.gRecaptchaResponse + "'";
            driver.executeScript(script, webElement).then(() => {
                driver.executeScript('document.forms[1].submit()');
                takeScreenShot();
            });
        }
    })
}

/**
 * function to answer query
 */
async function takeScreenShot () {
    await driver.sleep(1000).then(() => {
        driver.findElement(By.css('body > div:nth-child(2) > main > div > div.container-fluid')).takeScreenshot().then(
            (image, err) => {
                fs.writeFile('image/rues/' + nameScreen, image, 'base64', function(error) {
                    if(error!=null)
                        console.log('Error occured while saving screenshot' + error)
                })
            }
        ).then(() => { driver.quit(); })
    })
}