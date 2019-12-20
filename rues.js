require('chromedriver')

/**
 * Declared variables const
 */
// const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs')
const dbc = require("./deathbycaptcha/deathbycaptcha.js");
const client = new dbc.SocketClient("ortegon.carlos@gmail.com", "nm80vdBUE4OX26gB2UyL");

// client.get_user((user) => { console.log(user) })
// let nameScreen = `${ id + new Date() }.jpg`;
// let driver = []

client.get_balance((b) => {});

(async function example() {
    let driver = new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://www.rues.org.co/');
        let nit  = await driver.wait(until.elementLocated(By.id('NIT')), 1000);
        nit.sendKeys('901082646');
        await driver.findElement(By.id('btnConsultaNIT')).click();

        await driver.wait(until.elementLocated(By.css('#captchaPanel > form > div.g-recaptcha')), 10000);
        let captcha = await driver.findElement(By.css('#captchaPanel > form > div.g-recaptcha')).getAttribute('data-sitekey').then(() => {
            const token_params = JSON.stringify({
                'proxy': '',
                'proxytype': '',
                'googlekey': captcha,
                'pageurl': 'https://www.rues.org.co/Expediente'
            });
            console.log(token_params);
            client.decode({extra: {type: 4, token_params: token_params}}, (captcha) => {
                if (captcha) {
                    console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);
                    let webElement = driver.findElement(By.id("g-recaptcha-response"));
                    let script = "arguments[0].innerHTML='" + captcha['text'] + "'";
                    driver.executeScript(script, webElement);
                    driver.executeScript(
                        ()=>{
                            console.log(document.forms);
                            document.forms[2].submit();
                        }
                    )
                }
            });
        })
    } finally {
        // await driver.quit();
    }
})();
