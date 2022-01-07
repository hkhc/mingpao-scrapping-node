const {dateToString} = require('./utils.js');

test('dateToString', () => {

    const d = new Date(2012,11,20)
    expect(dateToString(d)).toBe("2012-12-20")

})
