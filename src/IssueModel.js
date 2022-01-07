import {dateToString} from './utils.js';

export function issuePath(date, version) {
    if (version) {
        return `/data/mingpao-${date.getFullYear()}/mingpao-${dateToString(date)}/${version}/mingpao-${version}-${dateToString(date)}.pdf`
    } else {
        return `/data/mingpao-${date.getFullYear()}/mingpao-${dateToString(date)}/mingpao-${dateToString(date)}.pdf`
    }
}

export function issueRecentPath(date, version) {
    if (version) {
        return `/data/recent/mingpao-${version}-${dateToString(date)}.pdf`
    } else {
        return `/data/recent/mingpao-${dateToString(date)}.pdf`
    }
}
