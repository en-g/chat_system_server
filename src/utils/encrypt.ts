import { createCipheriv } from 'crypto'

const encryptPassword = (password: string) => {
  const algorithm = process.env.ENCRYPT_ALGORITHM
  const secretKey = process.env.ENCRYPT_SECRETKEY
  const iv = process.env.ENCRYPT_IV
  const cipher = createCipheriv(algorithm, secretKey, iv)
  let encryptedText = cipher.update(password, 'utf8', 'hex')
  encryptedText += cipher.final('hex')
  return encryptedText
}

export { encryptPassword }
