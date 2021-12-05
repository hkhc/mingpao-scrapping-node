import AutoWebPage from './AutoWebPage.js';

export default class MingPaoIssuePage extends AutoWebPage {

    static selector = "//div[@class='number_wrap']/a[./img[contains(@src,'icon_')]]";

    constructor(args, site, page) {
        super(args, site, page);
    }

    async getSectionList() {
        const xpath = "//div[@class='number_wrap']/a[position()!=last()]/img";
        const elements = await this.page.$x(xpath);
        return Promise.all(elements.map(e => this.getAttribute(e, "title")));
    }

    async toSection(section) {
        const xpath = `//div[@class='number_wrap']/a[img[@title='${section}']]`;
        const elements = await this.page.$x(xpath);
        if (elements.length === 0) {
            throw `Section ${section} is not found`
        }
        await Promise.all([
            elements[0].click(),
            this.page.waitForNavigation()
        ]);
        return await this.site.lookupAutoWebPage(this.page);
    }

    getFilename(pageId, pageName, version) {
        const pureName = pageName
            .replaceAll(/-----/g, "advertisement") // advertisement
            .replaceAll(/\//g, "-") // advertisement
            .replaceAll(/ \(.*\)/g, '');
        return `mingpao-${version}-${pageId}-${pureName}.pdf`;
    }

    /*
     convert https://epaper.mingpao.com/content5.aspx?date=20211130&file=A10 to
            https://epaper.mingpao.com/path.ashx?type=page&date=20211130&file=A10
     */
    async anchorToPageInfo(e, section, version) {
        const url = new URL(this.page.url());
        const pageName = await this.getTextContent(await e.$("b"));

        // link1 must be accessed before link2 can be accessed successdfully.
        const link1 = "https://" + url.host + "/"+(await this.getAttribute(e, "href"));

        const link2 = link1
            .replaceAll(/content5\.aspx\?/g, "path.ashx?type=page&") // v5
            .replaceAll(/content2\.aspx\?/g, "path.ashx?type=page&") // v4
        const pageId = new URL(link1).searchParams.get("file");
        return {
            link1: link1,
            link2: link2,
            id: pageId,
            name: pageName,
            filename: this.getFilename(pageId, pageName, version),
            section: section
        }
    }

    async getPageLinkElements(section, version) {
        const xpath = "//div[table//a[img]]//a[img]"
        const elements = await this.page.$x(xpath)
        return Promise.all( elements.map( e => this.anchorToPageInfo(e, section, version)));
    }

    async isV5() {
        return (await this.page.$x("//div[@class='logo']/img[contains(@src, 'v5')]")).length!==0;
    }

    async isV4() {
        return (await this.page.$x("//div[@class='logo']/img[contains(@src, 'v4')]")).length!==0;
    }

}
