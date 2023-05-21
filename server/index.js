/* eslint consistent-return:0 import/order:0 */

const express = require("express");
const logger = require("./logger");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const argv = require("./argv");
const port = require("./port");
const ngrok = false;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const customHost = argv.host || process.env.HOST;
const host = customHost || null;
const prettyHost = customHost || "learn-nextjs";

// Log custom domain name
app.prepare().then(() => {
  const server = express();

  server.get("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  createServer(server).listen(port, host, async (err) => {
    if (err) {
      return logger.error(err.message);
    }

    // Connect to ngrok in dev mode
    if (ngrok) {
      let url;
      try {
        url = await ngrok.connect(port);
      } catch (e) {
        return logger.error(e);
      }
      logger.appStarted(port, prettyHost, url);
    } else {
      logger.appStarted(port, prettyHost);
    }
  });
});
