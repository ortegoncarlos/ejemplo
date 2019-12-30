require('chromedriver');

/**
 * id test 11002975
 * Declared variables const
 */
const id = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
let nameScreen = `image/ofac/${ id + ' - ' + new Date().toDateString() }.jpg`;
const Vision = require('./tools/vision');
let jsonResponse = `result/ofac - ${ id + ' - ' + new Date().toDateString() }.json`;
let driver = [];


/** call functions **/
run().catch(console.error);

/**
 * function initial
 * @returns {Promise<void>}
 */
async function run() {
    driver = new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://sanctionssearch.ofac.treas.gov/');
        await driver.wait(until.elementLocated(By.id('ctl00_MainContent_txtID')), 1000).sendKeys(id).then(() => {
            driver.findElement(By.id('ctl00_MainContent_btnSearch')).click().then( getInfo );
        });
    } finally {}
};

/**
 * @returns {Promise<void>}
 */
async function getInfo () {
    try {
        await driver.wait(until.elementLocated(By.id('btnDetails')), 5000).then(() => {
            driver.findElement(By.id('btnDetails')).click().then( response );
        });
    }catch (e) {
        await response(false)
    }
}

/**
 * @param sanctions boolean
 * function to answer query
 * @returns {Promise<void>}
 */
async function response (sanctions = true) {
    let resultJson = {
        'ofac': {
            'completed': true,
            'timestamp': new Date().getTime(),
            'screen': nameScreen
        }
    };
    await driver.sleep(1000).then(() => {
        driver.findElement(By.css('#framePage > div')).takeScreenshot().then(
            (image, err) => {
                fs.writeFile(nameScreen, image, 'base64', function(error) {
                    if(error!=null)
                        console.log('Error occured while saving screenshot' + error)
                })
            }
        ).then(() => {
            driver.findElement(By.css('#mainContentBox > div')).takeScreenshot().then(
                (image, err) => {
                    const visionApi = new Vision(image, 'buffer');
                    visionApi.getText().then(e => {
                        console.log(e);
                        if (!sanctions) {
                            resultJson['ofac']['alert'] = 'sancionado';
                            resultJson['ofac']['report'] = e;
                        } else {
                            resultJson['ofac']['alert'] = null;
                        }
                        fs.writeFile(jsonResponse, JSON.stringify(resultJson), function (error) {
                            if (error != null)
                                console.log('Error occured while saving JSON' + error)
                        });
                    }).then(() => { driver.quit(); });
                });
            });
        });
}