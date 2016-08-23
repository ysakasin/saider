function escapeHTML(str) {
    str = str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    return str;
}

function cspParams(host) {
    'default-src "self" ' + host + ' ws://' + host + '; img-src "self" *';
}

import crypto from 'crypto';
const seed = Date.now() * Math.random();
let serial = 1;

function generateId() {
    const data = seed + ':' + serial++;
    return crypto.createHash('sha1').update(data).digest('hex');
}

function passwordToHash(password) {
    let sha512 = crypto.createHash('sha512');
    sha512.update(password);
    return sha512.digest('hex');
}

let helper = {
    escapeHTML,
    cspParams,
    generateId,
    passwordToHash
};

export default helper;
