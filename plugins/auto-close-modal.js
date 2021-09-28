import { By, until } from 'selenium-webdriver'
import Timeout from 'await-timeout'

import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class AutoCloseModal extends BasePlugin {
  async run () {
    while (this.running) {
      logger.debug(this.loggerName + 'Listening for next react modal')
      await this.zoomContext.driver.wait(until.elementLocated(By.className('zm-modal')))
      await this.zoomContext.runExclusive(async () => {
        try {
          await this.zoomContext.closeModal()
          logger.debug(this.loggerName + 'Successfully closed current modal')
        } catch (e) {
          logger.error(this.loggerName + 'Error closing modal:')
          logger.error(e)
        }
      })

      await Timeout.set(5000)
    }
  }
}

export default AutoCloseModal
