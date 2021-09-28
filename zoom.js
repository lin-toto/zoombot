import { Builder, By, Key, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import firefox from 'selenium-webdriver/firefox.js'

import { merge } from 'lodash-es'
import { Mutex } from 'async-mutex'

class Zoom {
  constructor (name, config) {
    const defaultConfig = {
      joinUrl: undefined,
      meetingId: '',
      meetingPassword: '',
      name: '',
      email: '',
      driver: 'chrome',
      headless: true
    }

    this.name = name
    this.config = merge(defaultConfig, config)
    this.joined = false
    this.mutex = new Mutex()
  }

  async join () {
    if (this.joined) {
      throw new Error('Already joined meeting')
    }
    await this.buildDriver()

    let joinUrl = this.config.joinUrl
    if (!joinUrl) {
      joinUrl = 'https://zoom.us/wc/join/' + this.config.meetingId
    }

    await this.driver.get(joinUrl)
    await this.driver.findElement(By.name('inputname')).sendKeys(this.config.name, Key.RETURN)
    await this.driver.wait(until.urlMatches(/^https:\/\/zoom\.us\/wc\/\d+\/join/), 1000)

    while (true) {
      await this.driver.wait(until.elementLocated(By.css('#inputpasscode,.video-avatar__avatar')))
      const passwordInput = await this.driver.findElements(By.name('inputpasscode'))
      if (passwordInput.length !== 0) {
        await passwordInput[0].sendKeys(this.config.meetingPassword, Key.RETURN)
      } else {
        break
      }
    }

    this.joined = true
  }

  async leave () {
    await this.driver.quit()
    this.joined = false
  }

  async runExclusive (f) {
    if (!this.joined) {
      throw new Error('Meeting is not joined')
    }

    return this.mutex.runExclusive(f)
  }

  async openMenu () {
    this.assertInMutexAndJoined()
    await this.driver.executeScript("document.getElementsByTagName('footer')[0].classList = ['footer'];")
  }

  async openParticipants () {
    this.assertInMutexAndJoined()
    if ((await this.driver.findElements(By.className('participants-header__title'))).length !== 0) {
      return
    }

    await this.driver.wait(until.elementLocated(By.className('footer-button__participants-icon')))
    await this.driver.findElement(By.xpath('//div[@class="footer-button__participants-icon"]/../..')).click()
  }

  async mute () {
    this.assertInMutexAndJoined()
    await this.driver.findElement(By.xpath('//div[@class="participants-section-container__participants-footer-bottom window-content-bottom"]/button[2]')).click()
  }

  async openChat () {
    this.assertInMutexAndJoined()
    if ((await this.driver.findElements(By.className('chat-header__title'))).length !== 0) {
      return
    }

    await this.driver.wait(until.elementLocated(By.className('footer-button__chat-icon')))
    await this.driver.findElement(By.xpath('//div[@class="footer-button__chat-icon"]/../..')).click()
  }

  async fetchMessageList () {
    this.assertInMutexAndJoined()
    const messages = await this.driver.findElements(By.className('chat-message__text-box--others'))
    return await Promise.all(messages.map(async message => {
      return await message.getText()
    }))
  }

  async sendChatMessage (message) {
    this.assertInMutexAndJoined()
    await this.driver.wait(until.elementLocated(By.className('chat-box__chat-textarea')))
    await this.driver.findElement(By.className('chat-box__chat-textarea')).sendKeys(message, Key.RETURN)
  }

  assertInMutexAndJoined () {
    if (!this.joined) {
      throw new Error('Meeting is not joined')
    }

    if (!this.mutex.isLocked()) {
      throw new Error('Not executed in Mutex context')
    }
  }

  async buildDriver () {
    const driverBuilder = await new Builder().forBrowser(this.config.driver)

    if (this.config.headless) {
      const windowSize = { width: 1280, height: 720 }

      if (this.config.driver === 'chrome') {
        driverBuilder.setChromeOptions(new chrome.Options().headless().windowSize(windowSize))
      } else if (this.config.driver === 'firefox') {
        driverBuilder.setFirefoxOptions(new firefox.Options().headless().windowSize(windowSize))
      } else {
        throw new Error('Headless mode not yet supported for driver ' + this.config.driver)
      }
    }

    this.driver = driverBuilder.build()
  }
}

export default Zoom
