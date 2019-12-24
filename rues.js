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
// client.get_user((user) => { console.log(user) })
let nameScreen = `${ id + new Date().getTime() }.jpg`;
let driver = [];
let antiCap = [];

/**
 * run code
 */
(async function example() {
    driver = new Builder().forBrowser('chrome').build();
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
    } finally {
        // await driver.quit();
    }
})();

/**
 * Send request to solve taskId
 * @param taskId
 */
function getSolve (taskId) {
    const res = antiCap.getKeyCaptchaResolved(taskId);
    res.then(d => {
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
            // return d;
        }
    })
}

/**
 * take screenShot of the element div with information
 */
function takeScreenShot () {
    driver.sleep(1000).then(() => {
        driver.findElement(By.css('body > div:nth-child(2) > main > div > div.container-fluid')).takeScreenshot().then(
            (image, err) => {
                fs.writeFile('image/rues/' + nameScreen, image, 'base64', function(error) {
                    if(error!=null)
                        console.log('Error occured while saving screenshot' + error)
                })
            }
        )
    })
}