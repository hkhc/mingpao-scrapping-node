import Puppeteer from 'puppeteer';

export default class AutoWebSite {

    constructor(config, args) {
        this.config = config;
        this.args = args;
        this.browser = null;
        this.browserPage = null;
        this.currentPage = null;
    }

    async lookupAutoWebPage(page) {
        for(let factory of this.config.pages) {
            const selected = await page.$x(factory.selector)
            if (selected.length > 0) {
                this.args.verbose && console.log(`Page ${factory.name} is found`);
                return new factory(this, page)
            }
        }
        this.args.verbose && console.log("Page lookup failed");
        throw "Failed to lookup page";
    }

    async getBrowser() {

        if (this.browser === null) {
            console.log("Starting browser ...");
            this.browser = await Puppeteer.launch( {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--mute-audio'],
                dumpio: this.args.verbose,
                headless: true
            })
            console.log("Browser started ...");
        }
        return this.browser;
    }

    async getBrowserPage() {

        if (this.browserPage === null) {
            const browser = await this.getBrowser()
            this.args.verbose && console.log("Get browser page");
            this.browserPage = await browser.newPage();
            this.args.verbose && console.log("Get browser page succeed");
        }
        return this.browserPage;
    }

    async getCurrentPage() {
        if (this.currentPage === null) {
            this.currentPage = await this.loadPage(this.config.startUrl)
        }
        return this.currentPage;
    }

    async loadPage(url) {
        const bp = await this.getBrowserPage();
        this.args.verbose && console.log(`Loading page ${url}`)
        await Promise.all([
            bp.goto(url),
            bp.waitForNavigation()
        ]);
        return this.lookupAutoWebPage(bp);
    }

    async close() {
        if (this.browser !== null) {
            console.log("Stopping browser ...");
            this.browserPage = null;
            this.currentPage = null;
            await this.browser.close();
            console.log("Browser stopped ...");
            this.browser = null;
        }
    }

}
