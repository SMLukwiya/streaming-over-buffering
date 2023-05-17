import {request} from "node:http"
import {createGzip} from "node:zlib"
import {createReadStream} from "node:fs"
import {basename} from "node:path"
import {createCipheriv, randomBytes} from "node:crypto"

const [, , serverhost, filename, secretKey] = process.argv

const iv = randomBytes(16)
const key = Buffer.from(secretKey, 'hex')
const cipher = createCipheriv('aes192', key, iv)

const requestHttpOptions = {
    host: serverhost,
    port: 3000,
    path: "/",
    method: "PUT",
    headers: {
        'Content-Type': 'application/octet-stream',
        'Filename': basename(filename),
        'Content-Encoding': 'gzip',
        'Initialization-Vector': iv.toString('hex')
    }
}

const req = request(requestHttpOptions, (res) => {
    console.log(`Server responded with a ${res.statusCode}`)
})

createReadStream(filename)
    .pipe(createGzip())
    .pipe(cipher)
    .pipe(req)
    .on('finish', () => {
        console.log(`File ${filename} sent successfully to the server`)
    })