import AutoWebPage from './AutoWebPage.js';

export default class MingPaoConsentPage extends AutoWebPage {

    static selector = "//button[@aria-label='Consent']";

    constructor(site, page) {
        super(site, page);
    }

    async consent() {

        const consentButton = await this.page.$x("//button[@aria-label='Consent']");

        await consentButton[0].click();

        return await this.site.lookupAutoWebPage(this.page);
    }

}
