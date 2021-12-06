import {dateToString} from '../utils.js';
import AutoWebPage from './AutoWebPage.js';

export default class MingPaoCalendarPage extends AutoWebPage {

    static selector = "//a[@target='mpepaper']";

    constructor(site, page) {
        super(site, page);
    }

    async getCurrentYear() {
        const currentYearElement = await this.page.$x("//div[@class='cal_top']/cfoutput[2]");
        const yearStr = await this.getTextContent(currentYearElement[0])
        return parseInt(yearStr)
    }

    async toPreviousYear() {
        const link = await this.page.$x("//div[@class='cal_top']//a");
        await Promise.all([
            link[0].click(),
            this.page.waitForNavigation()
        ])
        return await this.site.lookupAutoWebPage(this.page);
    }

    async toNextYear() {
        const link = await this.page.$x("//div[@class='cal_top']//a");
        await Promise.all([
            link[1].click(),
            this.page.waitForNavigation()
        ])
        return await this.site.lookupAutoWebPage(this.page);
    }

    // targetYear : int
    async toYear(targetYear) {
        let currentYear = await this.getCurrentYear();
        let followingPage = this;
        while (targetYear !== currentYear) {
            if (targetYear < currentYear) {
                followingPage = await followingPage.toPreviousYear();
            } else if (targetYear > currentYear) {
                followingPage = await followingPage.toNextYear();
            }
            currentYear = await followingPage.getCurrentYear()
        }
        return followingPage;
    }

    // yyyy-mm-dd
    async getIssue(date) {

        const xpath = `(//div[@class='cal_main']/div[@class='cal'][${date.getMonth()+1}]//td[@bgcolor='FFFFCC']/a)[${date.getDate()}]`;
        const dayCell = await this.page.$x(xpath)

        try {
            await dayCell[0].click();
            let newPage = await this.pageAtNewTarget();
            return await this.site.lookupAutoWebPage(newPage);
        } catch (e) {
            console.log(`The issue (${dateToString(date)}) is not available`);
        }
    }

}
