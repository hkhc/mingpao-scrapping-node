import AutoWebPage from './AutoWebPage.js';

export default class MingPaoHomePage extends AutoWebPage {

    static selector = "//li[@id='headerlogin']/a";

    constructor(site, page) {
        super(site, page);
    }

    async getLoginPage() {
        await Promise.all([
            this.page.click("#headerlogin > a"),
            this.page.waitForNavigation()
        ]);
        return await this.site.lookupAutoWebPage(this.page);
    }

}
