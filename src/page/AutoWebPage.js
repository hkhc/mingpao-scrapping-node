export default class AutoWebPage {

    constructor(site, page) {
        this.site = site;
        this.page = page;
        this.page.setDefaultNavigationTimeout(60000);
    }

    getTextContent(element) {
        return this.page.evaluate(el => el.textContent, element)
    }

    getAttribute(element, attributeName) {
        return this.page.evaluate((e, n) => e.getAttribute(n), element, attributeName)
    }

    async pageAtNewTarget() {

        let currentPageTarget = this.page.target();
        let newTarget = await this.site.browser.waitForTarget( (target) => {
            return target.opener() === currentPageTarget;
        });
        return await newTarget.page();

    }

}
