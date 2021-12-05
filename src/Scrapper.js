import fs from 'fs/promises';
import PDFMerger from 'pdf-merger-js';
import AutoWebSite from './AutoWebSite.js';
import {isFolder_asyncAwait} from './fileUtils.js';
import AutoWebPage from './page/AutoWebPage.js';
import MingPaoCalendarPage from './page/MingPaoCalendarPage.js';
import MingPaoHomePage from './page/MingPaoHomePage.js';
import MingPaoIssuePage from './page/MingPaoIssuePage.js';
import MingPaoLoginFailurePage from './page/MingPaoLoginFailurePage.js';
import MingPaoLoginPage from './page/MingPaoLoginPage.js';
import MingPaoPageV4Page from './page/MingPaoPageV4Page.js';
import MingPaoPageV5Page from './page/MingPaoPageV5Page.js';
import {dateToString} from './utils.js';

class MingPaoPageV4WrappedPage extends AutoWebPage {

    static selector = "//body[.//div[@id='Menu'] and .//div[@id='controler']]";

    constructor(args, site, page) {
        super(args, site, page);
    }

}

class MingPaoPageV5WrappedPage extends AutoWebPage {

    static selector = "//body[div[@id='Menu'] and div[@id='Content']]";

    constructor(args, site, page) {
        super(args, site, page);
    }

}

const config = {
    pages: [
        MingPaoHomePage,
        MingPaoLoginFailurePage,
        MingPaoLoginPage,
        MingPaoCalendarPage,
        MingPaoPageV4Page,
        MingPaoPageV4WrappedPage,
        MingPaoPageV5Page,
        MingPaoPageV5WrappedPage,
        MingPaoIssuePage
    ],
    pubname: "mingpao",
    startUrl: "https://news.mingpao.com/php/login1.php?successurl=pns%2F%25E6%2598%258E%25E5%25A0%25B1%25E6%2596%25B0%25E8%2581%259E%25E7%25B6%25B2%2Fmain"
}

export default class Scrapper {

    constructor(args) {
        this.args = args;
        this.site = new AutoWebSite(config, args);
    }

    async shouldSkip(id, outputFilename) {
        if (id < this.args.startPage || (this.args.endPage!=='' && id > this.args.endPage)) {
            this.args.verbose && console.log(`skip for out of page range (${id})`);
            return true;
        } else {
            let fileExists = await isFolder_asyncAwait(outputFilename);
            if (fileExists && this.args.skipFinished) {
                this.args.verbose && console.log(`skip for file has already exist (${outputFilename})`);
                return true;
            } else {
                this.args.verbose && console.log("not skipping");
                return false;
            }
        }

    }

    getUsername() {
        return process.env.MINGPAO_USERNAME;
    }

    getPassword() {
        return process.env.MINGPAO_PASSWORD;
    }

    async downloadForDate(date) {

        const dateYear = date.getFullYear()

        console.log(`Start downloading MingPao dated ${dateToString(date)} ...`);

        const homePage = await this.site.getCurrentPage();
        const loginPage = (homePage instanceof MingPaoLoginPage) ? homePage : await homePage.getLoginPage();
        const calendarPage = await loginPage.login(this.getUsername(), this.getPassword());
        if (!calendarPage) return;
        const issuePage = await calendarPage.getIssue(date);
        if (!issuePage) return;

        const sectionList = await issuePage.getSectionList();

        let mergedFilename = '';

        console.log("sectionList", sectionList);

        let version = null;
        let baseDir = null;

        const mergeList = [];

        for(const s of sectionList) {
            console.log("to section", s);

            const sectionPage = await issuePage.toSection(s);

            version = (await sectionPage.isV5()) ? 'v5' : 'v4';
            baseDir = `${this.args.basePath}/${this.site.config.pubname}-${dateYear}/${this.site.config.pubname}-${dateToString(date)}/${version}`
            mergedFilename = `${baseDir}/${this.site.config.pubname}-${version}-${dateToString( date)}.pdf`;

            await fs.mkdir(baseDir, { recursive: true })

            const pageInfos = (await sectionPage.getPageLinkElements(s, version));

            for(let i of pageInfos) {

                const outputFilename = `${baseDir}/${i.filename}`;

                mergeList.push(outputFilename);

                if (await this.shouldSkip(i.id, outputFilename)) continue;

                console.log(`page ${i.name} (${version})`)

                await this.site.loadPage(i.link1);
                const p2 = await this.site.loadPage(i.link2);

                await p2.pdf(outputFilename);
            }
        }

        if (!this.args.noMerging) {
            const merger = new PDFMerger();
            for (let filename of mergeList) {
                if (await isFolder_asyncAwait(filename)) {
                    merger.add(filename);
                } else {
                    this.args.verbose && console.log(`File (${filename}) is not exists for merging.`);
                }
            }
            console.log(`merge to ${mergedFilename}`);
            await merger.save(mergedFilename);
        }

        await this.site.close();

    }
}
