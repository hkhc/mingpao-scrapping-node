import date from 'date-and-time';
import {issuePath, issueRecentPath} from './IssueModel.js';

function parseDate(d) {
    return date.parse(d, "YYYY-DD-DD");
}

test('issuePath without version', () => {
    expect(issuePath(parseDate("2012-12-17")))
        .toBe("/data/mingpao-2012/mingpao-2012-01-17/mingpao-2012-01-17.pdf");

});

test('issuePath with version', () => {
    expect(issuePath(parseDate("2012-12-17"), "v5"))
        .toBe("/data/mingpao-2012/mingpao-2012-01-17/v5/mingpao-v5-2012-01-17.pdf");

});

test('issueRecentPath without version', () => {
    expect(issueRecentPath(parseDate("2012-12-17")))
        .toBe("/data/recent/mingpao-2012-01-17.pdf");

});

test('issuePath with version', () => {
    expect(issueRecentPath(parseDate("2012-12-17"), "v5"))
        .toBe("/data/recent/mingpao-v5-2012-01-17.pdf");
});
