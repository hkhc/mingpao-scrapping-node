// import addDays from 'date-and-time';
import dat from 'date-and-time';
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
import {dateFromString, dateToString} from './utils.js';

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

export function getRecentRange(days, today) {

    if (!today) {
        today = new Date();
    }
    let recentEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let recentStartDate = dat.addDays(recentEndDate, -days+1);

    return {
        startDate: recentStartDate,
        endDate: recentEndDate
    }

}

export function getResultFile(args, pubname, date) {

    let model = new IssueFileModel(args.basePath, pubname);
    let path = model.getIssueFilename('v4', date);
    return fs.access(path)
        .then(r => Promise.resolve(path))
        .catch(e => {
            path = model.getIssueFilename('v5', date);
            return fs.access(path)
                .then(r => Promise.resolve(path))
                .catch(e => Promise.resolve())
        })

}

export async function exists(path) {
    return fs.access(path)
        .then(r => Promise.resolve(true))
        .catch(e => Promise.resolve(false))
}

export function parseIssueFile(filename) {

    let re = /[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,2}/g
    let found = filename.match(re)
    let d = dateFromString(found[0])

    return d;
}

export async function fillRecent(args, days) {

    const recentDir = `${args.basePath}/recent`;
    const range = getRecentRange(days);

    let files = await fs.readdir(recentDir);
    for(let f in files) {
        let d = parseIssueFile(files[f])
        if (d<range.startDate || d>range.endDate) {
            await fs.rm(`${recentDir}/${files[f]}`)
        }
    }

}

export class IssueFileModel {

    constructor(basePath, pubname) {
        this.basePath = basePath;
        this.pubname = pubname;
    }

    getIssueDir(version, date) {

        const dateStr = dateToString(date);
        const dateYear = date.getFullYear();
        return `${this.basePath}/${this.pubname}-${dateYear}/${this.pubname}-${dateStr}/${version}`;

    }

    getIssueFilename(version, date) {

        const dateStr = dateToString(date);
        return `${this.getIssueDir(version, date)}/${this.pubname}-${version}-${dateStr}.pdf`;

    }

    getRecentIssueFilename(version, date) {

        const dateStr = dateToString(date);
        return `${this.basePath}/recent/${this.pubname}-${version}-${dateStr}.pdf`;

    }

}


export default class Scrapper {

    constructor(args) {
        this.args = args;
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

    async loginStep(site) {
        const homePage = await site.getCurrentPage();
        const loginPage = (homePage instanceof MingPaoLoginPage) ? homePage : await homePage.getLoginPage();
        console.log("Logging in");

        return await loginPage.login(this.getUsername(), this.getPassword());
    }

    async downloadForDate(date) {

        const dateYear = date.getFullYear()
        const dateStr = dateToString(date)

        console.log(`Start downloading MingPao dated ${dateStr} ...`);

        const site = new AutoWebSite(config, this.args);

        let calendarPage = await this.loginStep(site);
        console.log(`Getting Issue ${dateStr}`);

        calendarPage = await calendarPage.toYear(dateYear);
        const issuePage = await calendarPage.getIssue(date);

        const version = (await issuePage.isV5()) ? 'v5' : 'v4';
        const issueFileModel = new IssueFileModel(site.args.basePath, site.config.pubname);
        const issueDir = issueFileModel.getIssueDir(version, date);
        const issueFilename = issueFileModel.getIssueFilename(version, date);

        if (site.args.skipFinished && await isFolder_asyncAwait(issueFilename)) {
            site.args.verbose && console.log(`Issue for (${dateStr}) already exists, skip processing`);
            return;
        }

        await fs.mkdir(issueDir, { recursive: true })

        const sectionList = await issuePage.getSectionList();

        console.log(`sectionList ${sectionList}`);

        const mergeList = [];

        for(const s of sectionList) {
            console.log("to section", s);

            const sectionPage = await issuePage.toSection(s);

            const pageInfos = (await sectionPage.getPageLinkElements(s, version));

            for(let i of pageInfos) {

                const pageFilename = `${issueDir}/${i.filename}`;

                mergeList.push(pageFilename);

                if (await this.shouldSkip(i.id, pageFilename)) continue;

                console.log(`page ${i.name} (${version})`)

                await site.loadPage(i.link1);
                const p2 = await site.loadPage(i.link2);

                await p2.pdf(pageFilename);
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
            console.log(`merge to ${issueFilename}`);
            await merger.save(issueFilename);
        }

        const recentDir = `${this.args.basePath}/recent`;
        if (!await exists(recentDir)) {
            await fs.mkdir(recentDir);
        }
        await fs.copyFile(issueFilename, `${issueFileModel.getRecentIssueFilename(version, date)}`)

        await site.close();

    }

}
