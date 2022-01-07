import dat from 'date-and-time';
import * as fs from 'fs/promises';
import ExtractOptions from './ExtractOptions.js';
import Scrapper, {fillRecent} from './Scrapper.js';

(async () => {

    const extractOptions = new ExtractOptions();

    const args = extractOptions.checkOpts()

    args.verbose && console.log("args", args);

    if (!args.checkPassed) {
        process.exit(1);
    }

    let currentDate = new Date(args.startDate.getTime());
    while (currentDate <= args.endDate) {
        const scrapper = new Scrapper(args);
        await fs.mkdir(args.basePath, { recursive: true});
        await (scrapper.downloadForDate(currentDate)
            .catch(console.error))

        currentDate = dat.addDays(currentDate, 1);

        // let d = new Date(currentDate.getTime());
        // d.setDate(d.getDate() + 1);
        // currentDate = d;
    }

    await fillRecent(args, 7);

    console.log("finish");
    process.exit(1)

})().catch( e => {
    console.log("error", e);
    process.exit(1);
})
