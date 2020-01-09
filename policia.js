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
let resultJson = {
                'policia': {
                    'completed': false,
                    'timestamp': new Date().getTime(),
                }
            };
/** call functions **/
run().catch(console.error);

async function run (){
    driver = new Builder().forBrowser('chrome').build();
    startScan()
}

/**
 * function initial
 * @returns {Promise<void>}
 */
async function startScan () {
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
        await driver.wait(until.elementLocated(By.name('cedulaInput')), 3200).sendKeys(id);
        await driver.wait(until.elementLocated(By.id('capimg')), 1200).then(() => {
            removeloader()
        }).then( solveCaptcha );
    } catch (e) {
        await restart();
    }
}

/**
 * solved captcha by google vision
 * @returns {Promise<void>}
 */
async function solveCaptcha () {
    await driver.findElement(By.id('capimg')).takeScreenshot().then(image => {
        const visionApi = new Vision(image, 'buffer');
        visionApi.getText().then(async captchaSolved => {
            if (typeof captchaSolved === 'undefined'){ 
                throw Error ('Error en Vision Api')
            }
            else{
                captchaSolved = captchaSolved.replace(/\s/g, "");
                await driver.findElement(By.id('textcaptcha')).sendKeys(captchaSolved)
                await driver.findElement(By.id('j_idt19')).click()
                await driver.sleep(500).then( checkRedirection )
        
            }
            
        }).catch((error)=>{console.error(error)} );
    });
}

function removeloader(){
    driver.executeScript(
        ()=>{
            let el = document.querySelector(".preloader");
            el.parentNode.removeChild(el);
        }
    )
}
/**
 * Check form status
 * @returns {Promise<void>}
 */
async function checkRedirection () {
    await driver.findElement(By.className('ui-messages-warn-detail')).then( () => {
        driver.findElement(By.id('textcaptcha')).clear().then(() => {
            solveCaptcha();
        });
    })
    .catch( response )
}

/**
 * function to answer query
 * @returns {Promise<void>}
 */
async function response () {
    await driver.wait(until.elementLocated(By.id('form:j_idt8')), 500)
    .then(
        async ()=>{
            await driver.sleep(500);
            await driver.takeScreenshot().then(
                async (image, err) => {
                    fs.writeFile(nameScreen, image, 'base64', function(err) {
                            console.log(err);
                        });
                    const visionApiText = new Vision(image, 'buffer');
                    await visionApiText.getText().then(e => {
                        
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
                    });
                }
            ).then(
            ()=>{terminate()}
            )
        }
        )
    .catch(restart)
}

/**
 * @returns {Promise<void>}
 */
async function restart() {
    await startScan();
}

async function terminate(){
    await driver.quit();
    //send info to firebase
    await process.kill(process.pid);
}