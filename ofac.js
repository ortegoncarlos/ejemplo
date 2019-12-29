require('chromedriver');

/**
 * Declared variables const
 */
const name = process.argv[2]
const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('chromedriver').path;
const fs = require('fs');
const antiCaptcha = require('./tools/anticaptcha');
let nameScreen = `${ name + ' - ' + new Date().toDateString() }.jpg`;
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
        await driver.get('https://sanctionssearch.ofac.treas.gov/');
        await driver.wait(until.elementLocated(By.id('ctl00_MainContent_ddlCountry')), 1000).sendKeys('Colombia')
        await driver.wait(until.elementLocated(By.id('ctl00_MainContent_txtLastName')), 1000).sendKeys(name).then(() => {
            driver.findElement(By.id('ctl00_MainContent_btnSearch')).click();
        });
    } finally {}
};