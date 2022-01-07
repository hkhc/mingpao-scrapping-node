import dateFormat from 'date-format';

export const dateToString = (date) => {
    return dateFormat.asString("yyyy-MM-dd", date)
}

export const dateFromString = (dateString) => {
    const d = new Date(
        parseInt(dateString.substring(0,4)),
        parseInt(dateString.substring(5,7))-1,
        parseInt(dateString.substring(8,10)),
        0,0,0,0);
    return d
}
