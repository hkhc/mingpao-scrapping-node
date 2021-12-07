import fsCallback from 'fs';
import AutoWebPage from './AutoWebPage.js';

export default class MingPaoPageV5Page extends AutoWebPage {

    static selector = "//div[@id='main']/div[@id='controls']";

    constructor(site, page) {
        super(site, page);
    }

    async pdfStream(options) {

        this.site.args.verbose && console.log("output to "+options.path)
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

        this.page.addStyleTag({
            content: '#idrviewer { top: 0 !important }'
        })

        // remove the top navigation bar
        this.page.evaluate(() => {
            let control = document.querySelector("#controls");
            control.parentNode.removeChild(control);
        })

        const dimensions = await this.page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });

        const p1 = await this.page.$('#p1')
        const p1Size = await p1.evaluate(element => { return {
            width: element.clientWidth + 10,
            height: element.clientHeight + 10
        } });

        return this.pdfStream({
            path: outputFilename,
            margin: { left: 0, top: 0, right: 0, bottom: 0},
            width: dimensions.width,
            height: dimensions.width*(p1Size.height/p1Size.width)
        });

    }

}
