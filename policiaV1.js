require('chromedriver')

/**
 * Declared variables const
 */
const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver')
const path = require('chromedriver').path
const fs = require('fs')
const dbc = require("./deathbycaptcha/deathbycaptcha.js")
const client = new dbc.SocketClient("ortegon.carlos@gmail.com", "nm80vdBUE4OX26gB2UyL")
let nameScreen = `${ id + new Date() }.jpg`;
let driver = []

/** call functions **/
run().catch(console.error)

client.get_balance((b) => {})
/** variable that solved captcha **/
const solveCaptcha = (imagen, cb) => {
    // console.log('iniciando solvecpathca',imagen)
    client.upload({ captcha: imagen, extra: {}}, cb)
};

/**
 * function initial
 * @returns {Promise<void>}
 */
async function run () {
    driver = new Builder().forBrowser('chrome').build()
    try {
        await driver.get('https://antecedentes.policia.gov.co:7005/WebJudicial/index.xhtml')
        await driver.wait(until.elementLocated(By.name('aceptaOption')), 1000)
        await driver.executeScript(
            ()=>{
                let el = document.querySelector("#aceptaOption\\:0")
                el.setAttribute("checked","checked")
                PrimeFaces.ab({s:"continuarBtn",onco:function(xhr,status,args){window.location.href='/WebJudicial/antecedentes.xhtml'}})
            }
        )
        await completedForm()
    } finally {
        // await driver.quit()
    }
}

/**
 * function per complete form
 * @returns {Promise<void>}
 */
async function completedForm (captchaText = null) {
    if (captchaText) {
        await driver.findElement(By.id('textcaptcha')).sendKeys(captchaText)
        await driver.findElement(By.id('j_idt20')).click()
        await driver.wait(until.elementLocated(By.id('form:bt02')), 1000).then(async () => {
            driver.executeScript(
                ()=>{
                    let el = document.querySelector(".preloader");
                    el.parentNode.removeChild(el);
                }
            )
            await driver.sleep(1000).then(()=>{
                driver.takeScreenshot().then(
                    (image, err) => {
                        fs.writeFile('image/policia/' + nameScreen, image, 'base64', function(error) {
                            if(error!=null)
                                console.log('Error occured while saving screenshot' + error)
                        })
                    }
                )
            })
            await driver.quit()
        })
    } else {
        try {
            // await driver.wait(until.elementLocated(By.name('cedulaInput')), 1200).sendKeys("80076057")
            await driver.wait(until.elementLocated(By.name('cedulaInput')), 1200).sendKeys('' + id)
            await driver.wait(until.elementLocated(By.id('capimg')), 1200).then(() => {
                driver.executeScript(
                    ()=>{
                        let el = document.querySelector(".preloader");
                        el.parentNode.removeChild(el);
                    }
                )
            }).then(() => {
                driver.findElement(By.id('capimg')).takeScreenshot().then(
                    async function(image) {
                        await solveCaptcha(image,(captchaSolved) => {
                            // console.log('send',captchaSolved)
                            resolvedCaptcha(captchaSolved)
                        })
                    }
                )

            })
        } catch (e) {
            await driver.quit()
            await run()
        }
    }
}

/**
 * solve captcha - function recursive
 * @param jsonA
 */
function resolvedCaptcha (jsonA) {
    // console.log('before check', jsonA)
    client.get_captcha( jsonA.captcha, (captchaSolved) => {
        // console.log('response 1',captchaSolved)
        if (captchaSolved.text === '') {
            resolvedCaptcha(jsonA)
        } else {
            // parametersCaptcha = captchaSolved
            let varForm = completedForm(captchaSolved.text)
        }
    })
}
