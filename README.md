# LambdaTest Taiko

A plugin to run [Taiko](https://taiko.dev/) tests on [LambdaTest](https://lambdatest.com/) Platform.

### Installation

```shell
npm install lambdatest-taiko --save-dev
```

A plugin to run Taiko tests in Selenoid cluster

### Usage

```javascript
const { openBrowser, closeBrowser } = require('lambdatest-taiko');
const { goto } = require('taiko');

describe('Taiko Tests', async () => {
  const capabilities = {
    'browserName': 'Chrome',
    'version': '93.0',
    'platform': 'MacOS Catalina',
    'build': '<Build Name>',
    'name': '<Test Name>',
    'username': '<username>',
    'access_key': '<access_key>',
  };
  
  beforeSuite('Before Test Suite', async () => {
    await openBrowser({
      target: `ws://<remote_host>:<remote_port>/taiko`
    }); // Opens the browser on a remote machine
  });

  afterSuite('After Test Suite', async () => {
    await closeBrowser(); // Will close the browser and the test session
  });

  // Test step for the added taiko spec files
  step('Navigate to <url>', async url => {
    await goto(url)
  });
});
```
