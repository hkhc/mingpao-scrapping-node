import AutoWebPage from './AutoWebPage.js';

export default class MingPaoPageV4Page extends AutoWebPage {

    static selector = "//body/img";

    constructor(args, site, page) {
        super(args, site, page);
    }

    async pdf(outputFilename) {

        const dimensions = await this.page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });

        this.args.verbose && console.log("dimension", dimensions);

        const p1 = await this.page.$x('//img')
        const p1Size = await p1[0].evaluate(element => { return {
            width: element.clientWidth + 10,
            height: element.clientHeight + 10
        } });
        this.args.verbose && console.log("p1size", p1Size);

        this.args.verbose && console.log("output to "+outputFilename)
        await this.page.pdf({
            path: outputFilename,
            margin: { left: 0, top: 0, right: 0, bottom: 0},
            width: p1Size.width,
            height: p1Size.height
        });

    }

}
