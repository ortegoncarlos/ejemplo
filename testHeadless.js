//import the selenium web driver
let webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

let chromeCapabilities = webdriver.Capabilities.chrome();
let options = new chrome.Options();
//setting chrome options to start the browser fully maximized
let chromeOptions = {
    'args': ['--headless', '--start-maximized']
};
options.addArguments('--start-maximized')
chromeCapabilities.set('chrome_options', chromeOptions);

// let driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
let driver = new webdriver.Builder().withCapabilities(options.headless().windowSize({width: 1700, height: 2500})).build();
driver.get('https://www.w3schools.com/js/');
driver.wait(until.elementLocated(By.id('main')), 6000).then(() => {
    driver.findElement(By.id('main')).then(() => {
        driver.takeScreenshot().then(
            (image, err) => {
                fs.writeFile('image/headless.jpg', image, 'base64', function(error) {
                    if(error!=null)
                        console.log('Error occured while saving screenshot' + error)
                })
            }
        ).then(() => { driver.quit(); });
    });
});