import fsCallback from 'fs';
import AutoWebPage from './AutoWebPage.js';

export default class MingPaoPageV4Page extends AutoWebPage {

    static selector = "//body/img";

    constructor(site, page) {
        super(site, page);
    }

    async pdfStream(options) {

        const pdfStream = await this.page.createPDFStream(options);

        return new Promise((resolve, _) => {
            const writeStream = fsCallback.createWriteStream(options.path);
            pdfStream.pipe(writeStream);
            pdfStream.on('end', async() => {
                resolve()
            });
        })

    }

    async pdf(outputFilename) {

        const dimensions = await this.page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });

        this.site.args.verbose && console.log("dimension", dimensions);

        const p1 = await this.page.$x('//img')
        const p1Size = await p1[0].evaluate(element => { return {
            width: element.clientWidth + 10,
            height: element.clientHeight + 10
        } });
        this.site.args.verbose && console.log("p1size", p1Size);

        this.site.args.verbose && console.log("output to "+outputFilename)

        return this.pdfStream({
            path: outputFilename,
            margin: { left: 0, top: 0, right: 0, bottom: 0},
            width: p1Size.width,
            height: p1Size.height
        });

    }

}
