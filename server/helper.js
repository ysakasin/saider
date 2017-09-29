import crypto from 'crypto'

export function passwordToHash (password) {
  let sha512 = crypto.createHash('sha512')
  sha512.update(password)
  return sha512.digest('hex')
}

export default {
  passwordToHash
}
