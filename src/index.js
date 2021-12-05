import expandTilde from 'expand-tilde';
import * as fs from 'fs/promises';
import Options from 'node-getopt';
import path from 'path';
import Scrapper from './Scrapper.js';
import {dateToString} from './utils.js';


function getCurrentDate() {
    const d = new Date()
    return dateToString(d);
}

function dateFromString(dateString) {
    const d = new Date();
    d.setFullYear(parseInt(dateString.substring(0,4)));
    d.setMonth(parseInt(dateString.substring(5,7))-1)
    d.setDate(parseInt(dateString.substring(8,10)))
    return d
}

/*
        short_name = option[0],
        definition = option[1],
        comment = option[2],
        def = option[3];

 */
const opt = Options.create([
        ['', `base-path=ARG`, 'Base path (default to be ~/mingpao', '~/mingpao'],
        ['', `start-date=ARG`, 'Start date (YYYY-MM-DD), default to be current date', getCurrentDate()],
        ['', 'end-date=ARG', 'End date (YYYY-MM-DD), default to be start date'],
        ['', 'start-page=ARG', 'Start Page, default to be A01', 'A01'],
        ['', 'end-page=ARG', 'End Page, default to be the last page'],
        ['', 'skip-finished', 'End Page, default to be the last page', false],
        ['', 'no-merging', 'do not merge, default is false', false],
        ['', 'verbose', 'verbose', false],
        ['h' , 'help' , 'display this help'],
    ])
    .bindHelp()
    .parseSystem();

function checkOpts(options) {

    let args = {
        startDateStr: options['start-date'],
        startPage: options['start-page'],
        basePath: options['base-path'],
        skipFinished: options['skip-finished'],
        noMerging: options['no-merging'],
        verbose: options['verbose']
    }

    args = {
        ...args,
        basePath: expandTilde(path.normalize(args.basePath))
    }

    args = {
        ...args,
        endDateStr: options['end-date'] || args.startDateStr,
        endPage: options['end-page'] || '',
    }

    args = {
        ...args,
        startDate: dateFromString(args.startDateStr),
        endDate: dateFromString(args.endDateStr),
        checkPassed : true
    }

    if (isNaN(args.startDate.getTime())) {
        console.log(`Start date (${args.startDateStr}) is invalid (YYYY-MM-DD)`)
        args.checkPassed = false
    }

    if (isNaN(args.endDate.getTime())) {
        console.log(`End date (${args.endDateStr}) is invalid (YYYY-MM-DD)`)
        args.checkPassed = false
    }

    if (args.endDate < args.startDate) {
        console.log(`End date (${args.endDateStr}) cannot be earlier than start date (${args.startDateStr}).`)
        args.checkPassed = false
    }

    if (args.endPage!== '' && args.endPage < args.startPage) {
        console.log(`End page (${args.endPage}) cannot be in front of the start page (${args.startPage}).`)
        args.checkPassed = false
    }

    return args;
}

(async (options) => {

    const args = checkOpts(options)

    args.verbose && console.log("args", args);

    if (!args.checkPassed) {
        process.exit(1);
    }

    let currentDate = new Date(args.startDate.getTime());
    while (currentDate <= args.endDate) {
        const scrapper = new Scrapper(args);
        await fs.mkdir(args.basePath, { recursive: true});
        await scrapper.downloadForDate(currentDate)
        currentDate = new Date(currentDate.getTime() + 86400000)
    }
    console.log("finish");
    process.exit(1)

})(opt.options).catch( e => {
    console.log("error", e);
    process.exit(1);
})
