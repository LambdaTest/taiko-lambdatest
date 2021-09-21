const taiko = require("taiko");
const axios = require("axios");

// Session ID to be used in paths and to close the session
let session;

/**
 * Launches a browser with a tab. The browser will be closed when the parent node.js process is closed.
 * Makes an API call to LambdaTest to get the session ID and appends it to all the requests being triggered as query params
 *
 * @param {Object} [options={headless:true}] eg. {headless: true|false, args:['--window-size=1440,900']}
 * @param {boolean} [options.headless=true] - Option to open browser in headless/headful mode.
 * @param {Array<string>} [options.args=[]] - [Chromium browser launch options](https://peter.sh/experiments/chromium-command-line-switches/).
 * @param {string} [options.host='127.0.0.1'] - Remote host to connect to.
 * @param {string} [options.target] - Determines which target the client should interact.(https://github.com/cyrus-and/chrome-remote-interface#cdpoptions-callback)
 * @param {number} [options.port=0] - Remote debugging port, if not given connects to any open port.
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
    host,
    port,
    target,
    ignoreCertificateErrors,
    observe,
    observeTime,
    dumpio,
  },
  capabilities
) => {
  try {
    const sessionCreateResponse = await axios.post(
      "http://asad-cdp.dev.lambdatest.io:31333/cdp/session",
      capabilities
    );
    session =
      sessionCreateResponse &&
      sessionCreateResponse.data &&
      sessionCreateResponse.data.session;

    console.log(
      "sessionCreateResponse, session=====>",
      sessionCreateResponse,
      session
    );

    return taiko.openBrowser({
      headless,
      args,
      host,
      port,
      target,
      ignoreCertificateErrors,
      observe,
      observeTime,
      dumpio,
      alterPath: (path) =>
        // Add session ID as a query param to all paths
        `${path}?session=${session}`,
    });
  } catch (e) {
    console.error("Error occurred in opening the browser session: ", e);
    return e;
  }
};

/**
 * Closes the browser session and makes an API call to lambdatest to cleanup resources
 * @returns {Promise<void>}
 */
const closeBrowser = async () => {
  try {
    const closeResponse = await taiko.closeBrowser();
    if (session) {
      await axios.delete("<LT_CLOSE_SESSION_URL>", {
        params: {
          session,
        },
      });
    }

    return closeResponse;
  } catch (e) {
    console.error("Error occurred in closing the browser session: ", e);
    return e;
  }
};

module.exports = {
  openBrowser,
  closeBrowser,
};
