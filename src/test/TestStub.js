import puppeteer from 'puppeteer';

export const stubPage = {

    async $x(xpath) {
        return Promise.resolve()
    },

    evaluate(block, element) {
        return Promise.resolve(block(element));
    },

    setDefaultNavigationTimeout(timeout) {

    },

    async goto(url) {
        return stubPage;
    },

    async waitForNavigation() {
        return;
    }


};


export const stubElementHandle = {
    $eval() {
        return Promise.resolve();
    }
};

export const stubSite = {

}

export const stubPuppeteer = {

    async launch() {
        return Promise.resolve()
    },


}

export const stubBrowser = {
    async loadPage(url) {
        return stubPage;
    },
    async newPage() {
        return stubPage;
    }
}


// jest.mock('puppeteer', () => (
//     {
//         launch() {
//
//             let stubPage = {
//
//                 async $x(xpath) {
//                     return Promise.resolve()
//                 },
//
//                 evaluate(block, element) {
//                     return Promise.resolve(block(element));
//                 },
//
//                 setDefaultNavigationTimeout(timeout) {
//
//                 },
//
//                 async goto(url) {
//                     return stubPage;
//                 },
//
//                 async waitForNavigation() {
//                     return;
//                 }
//
//
//             };
//
//             return Promise.resolve(stubBrowser);
//         }
//     }
// ));

