import AutoWebPage from './AutoWebPage.js';

export default class MingPaoLoginFailurePage extends AutoWebPage {

    static selector = "//div[@class='header-content mx-auto'][contains(text(), '登入失敗')]";

    constructor(args, site, page) {
        super(args, site, page);
    }

}
