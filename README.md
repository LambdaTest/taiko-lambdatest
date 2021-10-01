# Taiko-LambdaTest

A plugin to run [Taiko](https://taiko.dev/) tests on LambdaTest Platform.

### Installation

```shell
npm install lambdatest-taiko --save-dev
```

A plugin to run taiko tests in Selenoid cluster

### Usage

Add `TAIKO_PLUGIN=taiko-lambdatest` to your env

```javascript
const { openBrowser, closeBrowser } = require('taiko');

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

  it('Taiko Test', async () => {
    await goto('google.com');
  });
});
```
