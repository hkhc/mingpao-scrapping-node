//import Puppeteer from 'puppeteer';
import AutoWebSite from './AutoWebSite.js';
import AutoWebPage from './page/AutoWebPage.js';
import {stubPuppeteer, stubBrowser, stubElementHandle, stubPage, } from './test/TestStub.js';


class TestOnePage extends AutoWebPage {

    static selector = "xpath-test-one";

    constructor(site, page) {
        super(site, page);
    }

}

class TestTwoPage extends AutoWebPage {

    static selector = "xpath-test-two";

    constructor(site, page) {
        super(site, page);
    }

}

test.each`
    verbose
    ${true},
    ${false}
`("lookupAutoWebPage to the first page object in config", async ( { verbose } ) => {

    jest.spyOn(stubBrowser, 'loadPage').mockReturnValue(Promise.resolve(stubPage))
    jest.spyOn(stubPuppeteer, 'launch').mockReturnValue(Promise.resolve(stubBrowser))
    jest.spyOn(stubPage, '$x').mockReturnValue(Promise.resolve([stubElementHandle]));

    const config = {
        pages: [
            TestOnePage,
            TestTwoPage
        ],
        pubname: "mingpao",
        startUrl: "https://main.com/page"
    }

    const site = new AutoWebSite(config, {
        verbose: verbose
    }, stubPuppeteer);

    const browser = await site.getBrowser();
    const browserPage = await browser.loadPage("https://google.com");
    const page = await site.lookupAutoWebPage(browserPage)

    expect(page).toBeInstanceOf(TestOnePage);


})

test.each`
    verbose
    ${true},
    ${false}
`("loadPage to the first page object in config", async ( { verbose } ) => {

    jest.spyOn(stubPage, '$x').mockReturnValue(Promise.resolve([stubElementHandle]));

    const config = {
        pages: [
            TestOnePage,
            TestTwoPage
        ],
        pubname: "mingpao",
        startUrl: "https://main.com/page"
    }

    const site = new AutoWebSite(config, {
        verbose: verbose
    }, stubPuppeteer);

    const page = await site.loadPage("https://google.com");

    expect(page).toBeInstanceOf(TestOnePage);


})

test.each`
    verbose
    ${true},
    ${false}
`("lookupPage fails", async ( { verbose } ) => {

    jest.spyOn(stubPage, '$x').mockReturnValue(Promise.resolve([]));

    const config = {
        pages: [
            TestOnePage,
            TestTwoPage
        ],
        pubname: "mingpao",
        startUrl: "https://main.com/page",
    }

    const site = new AutoWebSite(config, {
        verbose: verbose
    }, stubPuppeteer);

    const browser = await site.getBrowser();

    const browserPage = await browser.loadPage("https://google.com")

    await expect(async () => { await site.lookupAutoWebPage(browserPage) } )
        .rejects.toThrow("Failed to lookup page")

})

test.each`
    verbose
    ${true},
    ${false}
`("loadPage to the second page object in config", async () => {

    jest.spyOn(stubPage, '$x')
        .mockReturnValueOnce(Promise.resolve([]))
        .mockReturnValueOnce(Promise.resolve([stubElementHandle]));

    const config = {
        pages: [
            TestOnePage,
            TestTwoPage
        ],
        pubname: "mingpao",
        startUrl: "https://main.com/page"
    }

    const site = new AutoWebSite(config, {
        verbose: false
    }, stubPuppeteer);

    const page = await site.loadPage("https://google.com");

    expect(page).toBeInstanceOf(TestTwoPage);

})
