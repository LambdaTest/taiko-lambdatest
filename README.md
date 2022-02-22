# Taiko Lambdatest

A plugin to run [Taiko](https://taiko.dev/) tests on [LambdaTest](https://lambdatest.com/) Platform.

### Installation

```shell
npm install taiko-lambdatest --save-dev
```

### Usage

```javascript
const { goto, openBrowser, closeBrowser } = require('taiko');

describe('Taiko Tests', async () => {
  const capabilities = {
    'browserName': 'Chrome',
    'browserVersion': '93.0',
    'LT:Options': {
      'platform': 'Windows 10',
      'build': '<Build Name>',
      'name': '<Test Name>',
      'user': '<username>',
      'accessKey': '<accessKey>',
      'network': true
    }
  }
  
  beforeScenario('Before Test Suite', async () => {
    await openBrowser({
      target: `ws://<remote_host>:<remote_port>/taiko`
    },
        capabilities
    ); // Opens the browser on a remote machine
  });

  afterScenario('After Test Suite', async (context) => {
    await closeBrowser(context); // Will close the browser and the test session
  });

  // Test step for the added taiko spec files
  step('Navigate to <url>', async url => {
    await goto(url)
  });
});
```
