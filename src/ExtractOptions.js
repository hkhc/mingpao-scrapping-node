import expandTilde from 'expand-tilde';
import Options from 'node-getopt';
import path from 'path';
import {dateFromString, dateToString} from './utils.js';

export default class ExtractOptions {

    constructor(args, dateFunction = () => new Date()) {

        /*
                short_name = option[0],
                definition = option[1],
                comment = option[2],
                def = option[3];

         */

        const today = dateFunction();

        this.opt = Options.create([
            ['', `base-path=ARG`, 'Base path (default to be ~/mingpao', '~/mingpao'],
            ['', `start-date=ARG`, 'Start date (YYYY-MM-DD), default to be current date', dateToString(today)],
            ['', 'end-date=ARG', 'End date (YYYY-MM-DD), default to be start date'],
            ['', 'start-page=ARG', 'Start Page, default to be A01', 'A01'],
            ['', 'end-page=ARG', 'End Page, default to be the last page'],
            ['', 'skip-finished', 'End Page, default to be the last page', false],
            ['', 'no-merging', 'do not merge, default is false', false],
            ['', 'verbose', 'verbose', false],
            ['h' , 'help' , 'display this help'],
        ])
        .bindHelp()

        if (args) {
            this.opt.parse(args);
        } else {
            console.log("parse system param");
            this.opt.parseSystem();
        }

    }

    checkOpts(parsedOptions = this.opt.options) {

        let args = {
            startDateStr: parsedOptions['start-date'],
            startPage: parsedOptions['start-page'],
            basePath: parsedOptions['base-path'],
            skipFinished: parsedOptions['skip-finished'],
            noMerging: parsedOptions['no-merging'],
            verbose: parsedOptions['verbose'],
            errorMessage: [],
            checkPassed: true
        }

        args = {
            ...args,
            basePath: expandTilde(path.normalize(args.basePath))
        }

        args = {
            ...args,
            endDateStr: parsedOptions['end-date'] || args.startDateStr,
            endPage: parsedOptions['end-page'] || '',
        }

        args = {
            ...args,
            startDate: dateFromString(args.startDateStr),
            endDate: dateFromString(args.endDateStr),
        }

        if (isNaN(args.startDate.getTime())) {
            args.errorMessage.push(`Start date (${args.startDateStr}) is invalid (YYYY-MM-DD)`);
            args.checkPassed = false;
        }

        if (isNaN(args.endDate.getTime())) {
            args.errorMessage.push(`End date (${args.endDateStr}) is invalid (YYYY-MM-DD)`);
            args.checkPassed = false;
        }

        if (args.endDate < args.startDate) {
            args.errorMessage.push(`End date (${args.endDateStr}) cannot be earlier than start date (${args.startDateStr}).`);
            args.checkPassed = false;
        }

        if (args.endPage!== '' && args.endPage < args.startPage) {
            args.errorMessage.push(`End page (${args.endPage}) cannot be in front of the start page (${args.startPage}).`)
            args.checkPassed = false;
        }

        return args;
    }

}
