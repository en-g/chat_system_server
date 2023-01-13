import { createCipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const iv = randomBytes(16)
const password = 'chat_system'

const getBuffer = async () => {
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer
  const cipher = createCipheriv('aes-256-ctr', key, iv)

  const textToEncrypt = 'Nest'

  const encryptedText = Buffer.concat([cipher.update(textToEncrypt), cipher.final()])
  return encryptedText.toString('utf-8')
}

export { getBuffer }
