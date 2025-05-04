import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import path from 'path';
import { createServer } from 'https';

const DEV_DEVICE_IP = process.env.DEV_DEVICE_IP as string
const DEV_CERT_KEY = process.env.DEV_CERT_KEY as string
const DEV_CERT = process.env.DEV_CERT as string

const uaccess_file = `.uaccess`
if (!fs.existsSync(uaccess_file)) {
    console.log('Creating empty uaccess file')
    fs.writeFileSync(uaccess_file, '', 'utf-8')
}

if(process.env.DEV_MODE === 'true') console.log('!!!Server is in DEV mode. Only developers can create rooms!!!')

import next from "next";
import { parse } from "url";
import { getServerAccessToken } from "./utils/TwitchUtils";

const dev = process.env.NODE_ENV !== 'production';
const hostname = DEV_DEVICE_IP;
const port = 3000;

// Add HTTPS options
const httpsOptions = {
    key: fs.readFileSync(DEV_CERT_KEY),
    cert: fs.readFileSync(DEV_CERT)
};

// when using middleware `hostname` and `port` must be provided below
let tokensPromise = getServerAccessToken()

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
app.prepare().then(async () => {
    const tokens = await tokensPromise
    if(!tokens?.access_token) throw new Error("Unable to authenticate with twitch!")
    
    createServer(httpsOptions, async (req, res) => {
        try {
            if (!req.url) return

            const parsedUrl = parse(req.url, true);
            const { pathname, query } = parsedUrl;
            // Check if the URL matches the desired pattern
            if (pathname && pathname.includes('/room/stats/') && pathname.split('/').length === 5) {
                let params = pathname.split('/')
                const room_id = params[3] as string;
                const session_id = params[4] as string;

                // Read the HTML file and serve it
                const filePath = path.join(__dirname, `.storage/stats/${room_id}/${session_id}/stats-final.html`);
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        res.statusCode = 404;
                        res.end('404 stats not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            } else {
                // For other URLs, let Next.js handle them
                await handle(req, res, parsedUrl);
            }
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on https://${hostname}:${port}`);
        });
});