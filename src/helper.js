import crypto from 'crypto';

const seed = Date.now() * Math.random();
let serial = 1;

export function generateId() {
    const data = seed + ':' + serial++;
    return crypto.createHash('sha1').update(data).digest('hex');
}

export function passwordToHash(password) {
    let sha512 = crypto.createHash('sha512');
    sha512.update(password);
    return sha512.digest('hex');
}

export function either(value) {
    return (option) => value ? value : option
}

export default {
    either,
    generateId,
    passwordToHash
};
