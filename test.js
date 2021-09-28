const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://zoom.us/wc/join/2578824069');
    await driver.findElement(By.name('inputname')).sendKeys('test', Key.RETURN);
    await driver.wait(until.urlMatches(/^https:\/\/zoom\.us\/wc\/\d+\/join/), 1000);

    const passwordInput = await driver.findElement(By.name('inputpasscode'));
    if (passwordInput) {
      await passwordInput.sendKeys('cB6YCQ', Key.RETURN);
    }

    await driver.wait(until.elementLocated(By.className('video-avatar__avatar')));
    await driver.executeScript("document.getElementsByTagName('footer')[0].classList = ['footer'];");

    await driver.wait(until.elementLocated(By.css("[aria-label='open the chat pane']")));
    await driver.findElement(By.css("[aria-label='open the chat pane']")).click();
    await driver.wait(until.elementLocated(By.className('chat-box__chat-textarea')));
    await driver.findElement(By.className('chat-box__chat-textarea')).sendKeys('gay gay', Key.RETURN);
  } finally {

  }
})();
