import {stubElementHandle, stubPage, stubSite} from '../test/TestStub.js';
import AutoWebPage from './AutoWebPage.js';

test("autowebpage textcontent", async () => {

    stubElementHandle.textContent = "Hello World";
    jest.spyOn(stubPage, '$x').mockReturnValue(Promise.resolve([stubElementHandle]));

    const config = {
        pages: [],
        pubname: "mingpao",
        startUrl: "https://main.com/page"
    }

    const autoWebPage = new AutoWebPage(stubSite, stubPage);

    const elements = await stubPage.$x("my-xpath-1");
    expect(elements[0].textContent).toBe("Hello World");
    await expect(await autoWebPage.getTextContent(elements[0])).toBe("Hello World");



})
