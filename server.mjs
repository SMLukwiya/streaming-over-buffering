import {createServer} from "node:http"
import {join, basename} from "node:path"
import {createGunzip} from "node:zlib"
import {createDecipheriv, randomBytes} from "node:crypto"
import {createWriteStream} from "node:fs"

const key = randomBytes(24)
console.log(`Generated key for client: ${key.toString('hex')}`)

const server = createServer((req, res) => {
    const filename = req.headers['filename']
    const iv = Buffer.from(req.headers['initialization-vector'], 'hex')
    const decipher = createDecipheriv('aes192', key, iv)
    const destination = join('server-files', basename(filename))

    req
        .pipe(decipher)
        .pipe(createGunzip())
        .pipe(createWriteStream(destination))
        .on('finish', () => {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.end('Ok\n')
            console.log('Done copying file')
        })
})

server.listen(3000, () => console.log('Server listening on port 3000'))