import { By, until } from 'selenium-webdriver'
import Timeout from 'await-timeout'

import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class MuteOnEnter extends BasePlugin {
  async run () {
    while (this.running) {
      try {
        await this.zoomContext.runExclusive(async () => {
          await this.zoomContext.openMenu()
          await this.zoomContext.openParticipants()

          await this.zoomContext.driver.wait(until.elementLocated(
            By.xpath('//div[@class="participants-section-container__participants-footer-bottom window-content-bottom"]/button[2]'
            )))
          await this.zoomContext.mute()
          logger.info(this.loggerName + 'Successfully muted current user')
        })

        this.running = false
      } catch (e) {
        logger.error(this.loggerName + 'Error muting current user:')
        logger.error(e)

        logger.debug(this.loggerName + 'Retry muting in 1 seconds')
        await Timeout.set(1000)
      }
    }
  }
}

export default MuteOnEnter
