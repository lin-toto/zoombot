import Timeout from 'await-timeout'
import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class AutoAttendance extends BasePlugin {
  constructor(name, zoomContext, config) {
    super(name, zoomContext, config, {
      regex: undefined,
      message: "",
      checkInterval: 5000,
      timeoutBeforeMessage: 0
    })
  }

  async run() {
    const loggerName = `[AutoAttendance/${this.name}] `

    while (this.running) {
      await Timeout.set(this.config.checkInterval)
      try {
        await this.zoomContext.runExclusive(async () => {
          await this.zoomContext.openMenu()
          await this.zoomContext.openChat()
          const fetchedMessages = await this.zoomContext.fetchMessageList()
          logger.debug(loggerName + 'Fetched message list: ', fetchedMessages)

          for (const message of fetchedMessages) {
            if (message.match(this.regex)) {
              logger.debug(loggerName + 'Regex has been matched in message: ' + message)

              if (this.config.timeoutBeforeMessage) {
                await Timeout.set(this.config.timeoutBeforeMessage)
              }
              this.zoomContext.sendChatMessage(this.config.message)
              logger.info(loggerName + 'Sent attendance message')

              this.running = false
              break
            }
          }
        })
      } catch (e) {
        logger.error(loggerName + `Unexpected error occurred`)
        logger.error(e)
      }
    }
  }
}

export default AutoAttendance
