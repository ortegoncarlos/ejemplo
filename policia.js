require('chromedriver')

/**
 * Declared variables const
 */
const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
const Vision = require('./tools/vision');
let nameScreen = `image/policia/${ id + ' - ' + new Date().toDateString() }.jpg`;
let jsonResponse = `result/policia - ${ id + ' - ' + new Date().toDateString() }.json`;
let driver = [];

/** call functions **/
run().catch(console.error);

/**
 * function initial
 * @returns {Promise<void>}
 */
async function run () {
    driver = new Builder().forBrowser('chrome').build();
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
 * function to complete form
 * @returns {Promise<void>}
 */
async function completedForm () {
    try {
        await driver.wait(until.elementLocated(By.name('cedulaInput')), 3200).sendKeys('' + id);
        await driver.wait(until.elementLocated(By.id('capimg')), 1200).then(() => {
            driver.executeScript(
                ()=>{
                    let el = document.querySelector(".preloader");
                    el.parentNode.removeChild(el);
                }
            )
        }).then( solvedCaptcha );
    } catch (e) {
        await restart();
    }
}

/**
 * solved captcha by google vision
 * @returns {Promise<void>}
 */
async function solvedCaptcha () {
    await driver.findElement(By.id('capimg')).takeScreenshot().then(image => {
        const visionApi = new Vision(image, 'buffer');
        visionApi.getText().then(e => {
            e = e.replace(/\s/g, "");
            driver.findElement(By.id('textcaptcha')).sendKeys(e).then(() => {
                driver.findElement(By.id('j_idt19')).click().then( checkRedirection )
            })
        });
    });
}

/**
 * Check form status
 * @returns {Promise<void>}
 */
async function checkRedirection () {
    await driver.sleep(2000);
    await driver.findElement(By.className('ui-messages-warn-detail')).then( () => {
        driver.findElement(By.id('textcaptcha')).clear().then(() => {
            solvedCaptcha();
        });
    }).catch( response );
}

/**
 * function to answer query
 * @returns {Promise<void>}
 */
async function response () {
    await driver.sleep(1000).then(()=>{
        driver.findElement(By.id('form:j_idt8')).takeScreenshot().then(
            (image, err) => {
                const visionApi = new Vision(image, 'buffer');
                visionApi.getText().then(e => {
                    fs.writeFile(nameScreen, image, 'base64', function(err) {
                        console.log(err);
                    });
                    console.log(e);
                    let resultJson = {
                        'policia': {
                            'completed': true,
                            'timestamp': new Date().getTime(),
                            'screen': nameScreen
                        }
                    };
                    if ( e.search('NO TIENE ASUNTOS PENDIENTES CON LAS AUTORIDADES JUDICIALES') >= 0 ) {
                        resultJson['policia']['alert'] = null;
                    } else {
                        resultJson['policia']['alert'] = 'antecedentes';
                        resultJson['policia']['report'] = e;
                    }
                    fs.writeFile(jsonResponse, JSON.stringify(resultJson), function (error) {
                        if (error != null)
                            console.log('Error occured while saving JSON' + error)
                    });
                }).then(() => { driver.quit(); });
            }
        ).catch( restart );
    });
}

/**
 * @returns {Promise<void>}
 */
async function restart() {
    await driver.quit();
    await run();
}