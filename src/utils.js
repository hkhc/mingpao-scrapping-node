import dateFormat from 'date-format';

export const dateToString = (date) => {
    return dateFormat.asString("yyyy-MM-dd", date)
}

