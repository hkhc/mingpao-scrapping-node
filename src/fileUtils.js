import fs from 'fs/promises';

function isErrorNotFound(err) {
    return err.code === "ENOENT";
}

export const isFolder_asyncAwait = async (path) => {
    // the result can be either false (from the caught error) or it can be an fs.stats object
    const result = await fs.stat(path).catch(err => {
        if (isErrorNotFound(err)) {
            return false;
        }
        throw err;
    });

    return !!result ;
}


