import Timeout from 'await-timeout'
import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class AutoAttendance extends BasePlugin {
  constructor (name, zoomContext, config) {
    super(name, zoomContext, config, {
      regex: undefined,
      message: '',
      checkInterval: 5000,
      timeoutBeforeMessage: 0
    })
  }

  async run () {
    while (this.running) {
      await Timeout.set(this.config.checkInterval)
      try {
        await this.zoomContext.runExclusive(async () => {
          await this.zoomContext.openMenu()
          await this.zoomContext.openChat()
          const fetchedMessages = await this.zoomContext.fetchMessageList()
          logger.debug(this.loggerName + 'Fetched message list: ', fetchedMessages)

          for (const message of fetchedMessages) {
            if (message.match(this.regex)) {
              logger.debug(this.loggerName + 'Regex has been matched in message: ' + message)

              if (this.config.timeoutBeforeMessage) {
                await Timeout.set(this.config.timeoutBeforeMessage)
              }
              await this.zoomContext.sendChatMessage(this.config.message)
              logger.info(this.loggerName + 'Successfully sent attendance message')

              this.running = false
              break
            }
          }
        })
      } catch (e) {
        logger.error(this.loggerName + 'Unexpected error occurred')
        logger.error(e)
      }
    }
  }
}

export default AutoAttendance
