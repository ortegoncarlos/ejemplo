require('chromedriver')

/**
 * Declared variables const
 */
// const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
const antiCaptcha = require('./tools/anticaptcha');
// client.get_user((user) => { console.log(user) })
// let nameScreen = `${ id + new Date() }.jpg`;
let driver = [];
let antiCap = [];

(async function example() {
    driver = new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://www.rues.org.co/');
        let nit  = await driver.wait(until.elementLocated(By.id('NIT')), 1000);
        nit.sendKeys('901082646');
        await driver.findElement(By.id('btnConsultaNIT')).click();

        await driver.wait(until.elementLocated(By.css('#captchaPanel > form > div.g-recaptcha')), 10000);
        await driver.findElement(By.css('#captchaPanel > form > div.g-recaptcha')).getAttribute('data-sitekey').then((key) => {
            antiCap = new antiCaptcha('https://www.rues.org.co/Expediente', key);
            const taskId = antiCap.createTaskIdApi();
            taskId.then(e => {
                driver.sleep(15000).then(async () => {
                    const res = await getSolve(e);
                    /* res.then(d => {
                        console.log(d)
                        if (d !== undefined) {
                            driver.executeScript(
                                ()=>{
                                    console.log('llo');
                                }
                            )
                            let webElement = driver.findElement(By.id("g-recaptcha-response"));
                            let script = "arguments[0].innerHTML='" + d.solution.gRecaptchaResponse + "'";
                            driver.executeScript(script, webElement);
                            /*driver.executeScript(
                                ()=>{
                                    console.log(document.forms);
                                    // document.forms[2].submit();
                                }
                            )*/
                       /* }
                    }) */
                });
            })
        })
    } finally {
        // await driver.quit();
    }
})();

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
            });
            // return d;
        }
    })
}