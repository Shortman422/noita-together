This will document two separate options for the process of how the webserver has been deployed
## Option 1: DigitalOcean
First, we need a DigitalOcean droplet, and a domain
Then we need to add SSL certificates, using the following guide: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04

For information on using PM2, and NGINX reverse proxy, please see this example
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04

Special notes:

- This assumes you have configured a Twitch Application
  - Add `https://DOMAIN/api/auth/code` to the redirect URLs
- Run `yarn install`
- Change directory to `nt-web-app/`
- Please setup the following `nt-web-app/.env`:
 
```sh
TWITCH_API_KEY= #Get this from Twitch
TWITCH_CLIENT_ID= #Get this from Twitch
OAUTH_REDIRECT_URI=https://DOMAIN.com #change this
WEBSERVER_AUTH_URL=https://DOMAIN.com #change this
NOITA_APP_REDIRECT_URI=http://localhost:25669 #keep this unchanged
DEV_MODE=false
```

- Run `node create-jwt-secret.js`, which will add the following to the .env.
  Please do not share these, or they will allow other users to forge authentication tokens
```sh
SECRET_JWT_ACCESS=someaccess-secret
SECRET_JWT_REFRESH=somerefresh-secret
```

Replace the following pm2 configuration with:

`pm2 start yarn --name nt-server -- server` where --name can be whatever you want

Then we need to add some steps to the NT client to point it at this

Add the following to the nt-app .env, then build executables for it :)
```sh
VUE_APP_HOSTNAME=https://DOMAIN/api # ex. https://example.com/api
VUE_APP_WS_PORT=:5466
VUE_APP_HOSTNAME_WS=DOMAIN # ex. example.com
```

## Option 2 - Local hosting
For development testing you can also directly host and forward the ports for the auth and lobby-server.

Twitch current requires HTTPS for OAuth Redirect URLs that are not `localhost`. A simple method to meet this requirement for testing is to self-sign a certificate.

One example is to utilize `mkcert`
  1. Windows instructions
  1. `choco install mkcert`
  1. `mkcert -install`
  1. `cd <location_you_want_to_store_certs>` ()
  1. `mkcert <name>`
  1. This should generate two files `name-key.pem` and `name.em`.

To identify your device's IPv4 address use `ipconfig /all`. An example would be `192.168.0.100`

Update the `nt-web-app/.env` file items
```sh
DEV_DEVICE_IP=<example: 192.168.X.XXX>
DEV_CERT_KEY=<your-path>/<name>-key.pem
DEV_CERT=<your-path>/<name>.pem
```

Identify your public IP ([https://www.google.com/search?q=what's+my+ip](https://www.google.com/search?q=what's+my+ip) is a simple method)

Update the `\nt-web-app\.env` file items with the public IP

```sh
OAUTH_REDIRECT_URI=https://XXX.XX.XXX.XXX:3000
WEBSERVER_AUTH_URL=https://XXX.XX.XXX.XXX:3000/api/auth/login
NEXT_PUBLIC_LOBBY_SERVER_API_URL_BASE=http://XXX.XX.XXX.XXX:4444/api
```

Update the `nt-app/.env` file items with the public IP as well

```sh
VUE_APP_HOSTNAME=https://XXX.XX.XXX.XXX:3000/api
VUE_APP_NT_LOGIN_URL=https://XXX.XX.XXX.XXX:3000/api/auth/login
VUE_APP_LOBBY_SERVER_WS_URL_BASE=ws://XXX.XX.XXX.XXX:4444/ws
```

Forward ports 3000 and 4444 for your device's IPv4 address according to your router's specifications.
Launch the auth server with `yarn workspace nt-web-app devHTTPS`