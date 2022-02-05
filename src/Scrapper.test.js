import {fillRecent, getRecentRange, getResultFile, IssueFileModel, parseIssueFile} from "./Scrapper.js";

test("date test", () => {

    let d1 = new Date()
    console.log(d1);
    console.log(d1.getFullYear(), d1.getMonth(), d1.getDate())

})

test('fillRecent with large enough date range', async () => {

    let range = getRecentRange(7, new Date(2020,10, 20))

    expect(range).toEqual({
        startDate: new Date(2020,10, 14),
        endDate: new Date(2020,10, 20),
    })

})

test('fillRecent with date range not large enough', async () => {

    let range = getRecentRange( 7, new Date(2020,10, 12))

    expect(range).toEqual({
        startDate: new Date(2020,10, 6),
        endDate: new Date(2020,10, 12),
    })

})

test("IssueFileModel", async () => {

    let model = new IssueFileModel(`test-data`, 'testpub')

    expect(model.getIssueFilename('v10', new Date(2233,2,4))).toBe(
        "test-data/testpub-2233/testpub-2233-03-04/v10/testpub-v10-2233-03-04.pdf"
    )

})

test("getResultFile", async () => {

    let path = await getResultFile({
        basePath: `${__dirname}/test-data`
    }, "testpub", new Date(2233,1,3))

    expect(path).toBe(
            `${__dirname}/test-data/testpub-2233/testpub-2233-02-03/v5/testpub-v5-2233-02-03.pdf`
    )

    path = await getResultFile({
        basePath: `${__dirname}/test-data`
    }, "testpub", new Date(2233,1,4))

    expect(path).toBe(
        `${__dirname}/test-data/testpub-2233/testpub-2233-02-04/v4/testpub-v4-2233-02-04.pdf`
    )

    path = await getResultFile({
        basePath: `${__dirname}/test-data`
    }, "testpubxx", new Date(2233,1,4))

    expect(path).toBeUndefined()

})

test("parseIssueFile", () => {

    expect(parseIssueFile("mingpao-v5-2020-11-11.pdf")).toEqual(new Date(2020,10,11))

})

test("fillRecent", async() => {

    await fillRecent({
        basePath: "/Volumes/archives/newspaper/mingpao"
    }, 7)

})
