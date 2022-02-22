const axios = require("axios");

// Session ID to be used in paths and to close the session
let session;
let cdpHost;
let cdpHostname;
let cdpPort;
let wsPath;
let openRemoteBrowser;
let closeRemoteBrowser;
let protocol;
let secure;
let lambdatestSession = false;
let user;
let accessKey;

const init = (taiko, eventHandlerProxy, descEvent, registerHooks) => {
  openRemoteBrowser = taiko.openBrowser;
  closeRemoteBrowser = taiko.closeBrowser;
  registerHooks({
    preConnectionHook: (target, options) =>
      // waitForNavigation removed temporarily
      // taiko.setConfig({ waitForNavigation: false });
      ({ target, options }),
  });
};

/**
 * Launches a browser with a tab. The browser will be closed when the parent node.js process is closed.
 * Makes an API call to LambdaTest to get the session ID and appends it to all the requests being triggered as query params
 *
 * @param {Object} [options={headless:true}] eg. {headless: true|false, args:["--window-size=1440,900"]}
 * @param {boolean} [options.headless=true] - Option to open browser in headless/headful mode.
 * @param {Array<string>} [options.args=[]] - [Chromium browser launch options](https://peter.sh/experiments/chromium-command-line-switches/).
 * @param {string} [options.target] - Determines which target the client should interact.(https://github.com/cyrus-and/chrome-remote-interface#cdpoptions-callback)
 * @param {boolean} [options.ignoreCertificateErrors=true] - Option to ignore certificate errors.
 * @param {boolean} [options.observe=false] - Option to run each command after a delay. Useful to observe what is happening in the browser.
 * @param {number} [options.observeTime=3000] - Option to modify delay time for observe mode. Accepts value in milliseconds.
 * @param {boolean} [options.dumpio=false] - Option to dump IO from browser.
 * @param {Object} [capabilities] - Test capabilities
 *
 * @returns {Promise<void>}
 */
const openBrowser = async (
  {
    headless,
    args,
    target,
    ignoreCertificateErrors,
    observe,
    observeTime,
    dumpio,
  },
  capabilities
) => {
  try {
    const targetWSURL = new URL(target);
    cdpHost = targetWSURL.host; // contains port too
    cdpHostname = targetWSURL.hostname;
    cdpPort =
      targetWSURL.port || (targetWSURL.protocol.includes("wss") ? 443 : 80);
    wsPath = targetWSURL.pathname;
    protocol = targetWSURL.protocol.includes("wss") ? "https:" : "http:";
    secure = targetWSURL.protocol.includes("wss");
    user = capabilities["LT:Options"].user;
    accessKey = capabilities["LT:Options"].accessKey;

    // Create a LambdaTest session call if target includes 'lambdatest'
    if (cdpHostname.includes("lambdatest")) {
      const sessionCreateResponse = await axios({
        method: "post",
        baseURL: `${protocol}//${cdpHost}`,
        url: "/cdp/session",
        data: capabilities,
      });

      session =
        sessionCreateResponse &&
        sessionCreateResponse.data &&
        sessionCreateResponse.data.session;

      lambdatestSession = true;
    }

    return openRemoteBrowser({
      headless,
      args,
      host: cdpHostname,
      port: cdpPort,
      target,
      ignoreCertificateErrors,
      observe,
      observeTime,
      dumpio,
      useHostName: true,
      secure,
      ...(lambdatestSession && {
        // specify alterPath only in case of lambdatestSession
        alterPath: (path) => {
          if (path.includes(wsPath)) {
            return `${path}/${session}`;
          }
          if (path.includes("devtools")) {
            return `${path}/${session}`;
          }

          return `${path}?session=${session}`;
        },
      }),
    });
  } catch (e) {
    console.error("Error occurred in opening the browser session: ", e.stack);
    return e;
  }
};

/**
 * Closes the browser session and makes an API call to lambdatest to cleanup resources
 *
 * @param {Object} [taikoContext] - Taiko context object
 * @returns {Promise<AxiosResponse<any>|*>}
 */
const closeBrowser = async (taikoContext) => {
  try {
    let closeResponse;
    const status =
      taikoContext &&
      taikoContext.currentSpec &&
      taikoContext.currentSpec.isFailed
        ? "failed"
        : "completed";

    // Call the delete session API if 'lambdatestSession' is set
    if (session && lambdatestSession) {
      closeResponse = await axios({
        method: "delete",
        baseURL: `${protocol}//${cdpHost}`,
        url: "/cdp/session",
        params: {
          session,
          status,
        },
        auth: {
          username: user,
          password: accessKey,
        },
      });
    } else {
      await closeRemoteBrowser();
    }

    return closeResponse;
  } catch (e) {
    console.error("Error occurred in closing the browser session: ", e.stack);
    return e;
  }
};

module.exports = {
  init,
  openBrowser,
  closeBrowser,
};
