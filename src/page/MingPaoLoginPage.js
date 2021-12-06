import AutoWebPage from './AutoWebPage.js';
import MingPaoLoginFailurePage from './MingPaoLoginFailurePage.js';

export default class MingPaoLoginPage extends AutoWebPage {

    static selector = "//form[@method='post' and contains(@action,'../php/login2.php')]";

    constructor(site, page) {
        super(site, page);
    }

    async login(username, password) {

        await this.page.type("#UserName", username);
        await this.page.type("#Password", password);
        const submitButtons = await this.page.$x("//button[@type='submit' and contains(@onclick, 'EPAPER')]")
        await Promise.all([
            submitButtons[0].click(),
            this.page.waitForNavigation()
        ])
        const resultPage = await this.site.lookupAutoWebPage(this.page);
        if (resultPage instanceof MingPaoLoginFailurePage) {
            console.log("Login failure");
            return null;
        } else
            return resultPage;
    }

}
