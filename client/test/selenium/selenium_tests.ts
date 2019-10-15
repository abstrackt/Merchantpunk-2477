import {Builder, By, Key, until} from 'selenium-webdriver';
import {Options} from "selenium-webdriver/chrome";
import {Server} from "http";
import {Express} from "express";
import * as path from "path";
import {expect} from "chai";
import "mocha";
import express = require('express');

const options = new Options().addArguments('--allow-file-access-from-files',
    '--disable-web-security', '--user-data-dir=.chrome');

const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options).build();

describe('DefaultTest', () => {

    let app: Express;
    let server: Server;

    before(() => {
        app = express();
        console.log(__dirname);
        app.use(express.static(path.join(__dirname, '../..')));
        server = app.listen(5000, () => console.log("listening..."));
    });

    it('buy more than current capacity', async function () {
        let name = 'test';
        this.timeout(20000);
        await driver.get('localhost:5000/index.html');
        await driver.wait(until.elementLocated(By.id('playbutton')));
        await driver.findElement(By.id('playbutton')).click();
        await driver.wait(until.elementLocated(By.id('nick')));
        await driver.findElement(By.id('nick')).sendKeys(name);
        await driver.findElement(By.id('submit')).click();

        await driver.wait(until.elementLocated(By.id('buy_product')));

        for (let i = 0; i < 40; i++) {
            await driver.findElement(By.id('buy_product')).click();
        }

        expect( await driver.findElement(By.id('in_bay')).getText()).to.eql("W ładowni: 27t");
        expect( await driver.findElement(By.id('money')).getText()).to.eql("703$");

    });

    it('buy something and send a ship somewhere', async function () {
        let name = 'test';
        this.timeout(70000);
        await driver.get('localhost:5000/index.html');
        await driver.wait(until.elementLocated(By.id('playbutton')));
        await driver.findElement(By.id('playbutton')).click();
        await driver.wait(until.elementLocated(By.id('nick')));
        await driver.findElement(By.id('nick')).sendKeys(name);
        await driver.findElement(By.id('submit')).click();

        await driver.wait(until.elementLocated(By.id('money')));
        expect( await driver.findElement(By.id('money')).getText()).to.eql("1000$");

        await driver.findElement(By.id('buy_product')).click();

        expect( await driver.findElement(By.id('money')).getText()).to.eql("989$");

        await driver.findElement(By.id('takeoff_popup')).click();
        await driver.wait(until.elementLocated(By.id('takeoff_button')));
        await driver.findElement(By.id('takeoff_button')).click();
        await driver.findElement(By.id('close')).click();
        await driver.sleep(50000);

        await driver.findElement(By.id('sell_product')).click();
        expect( await driver.findElement(By.id('money')).getText()).to.eql("995$");

    });

    after(async () => {
        driver.quit();
        server.close();
    });
});