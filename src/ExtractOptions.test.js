import ExtractOptions from './ExtractOptions.js';
import {dateFromString} from './utils.js';

test("default start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde"], () => dateFromString("2021-01-01"));
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.startDate).toStrictEqual(dateFromString("2021-01-01"));

})

test("valid start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-date=2012-12-12"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.errorMessage).toStrictEqual([]);

})

test("invalid start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-date=abcdefg"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeFalsy();
    expect(opts.errorMessage).toStrictEqual([
        "Start date (abcdefg) is invalid (YYYY-MM-DD)",
        "End date (abcdefg) is invalid (YYYY-MM-DD)",
    ]);

})

test("default end-date", () => {

    const o = new ExtractOptions(["--start-date=2021-12-01"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.endDate).toStrictEqual(dateFromString("2021-12-01"));

})


test("invalid end-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--end-date=abcdefg"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeFalsy();
    expect(opts.errorMessage).toStrictEqual([
        "End date (abcdefg) is invalid (YYYY-MM-DD)",
    ]);

})

test("end-date earlier than start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-date=2021-12-12", "--end-date=2021-12-11"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeFalsy();
    expect(opts.errorMessage).toStrictEqual([
        "End date (2021-12-11) cannot be earlier than start date (2021-12-12).",
    ]);

})

test("end-date equal to start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-date=2021-12-12", "--end-date=2021-12-12"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.errorMessage).toStrictEqual([]);

})

test("end-date later than start-date", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-date=2021-12-12", "--end-date=2022-12-12"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.errorMessage).toStrictEqual([]);

})

test("default start-page", () => {

    const o = new ExtractOptions([]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.startPage).toStrictEqual("A01");

})

test("default end-page", () => {

    const o = new ExtractOptions([]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeTruthy();
    expect(opts.endPage).toStrictEqual("");

})

test("end-page earlier than start-page", () => {

    const o = new ExtractOptions(["--base-path=abcde", "--start-page=B01", "--end-page=A01"]);
    const opts = o.checkOpts();
    expect(opts.checkPassed).toBeFalsy();
    expect(opts.errorMessage).toStrictEqual([
        "End page (A01) cannot be in front of the start page (B01).",
    ]);

})
