import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class MuteOnEnter extends BasePlugin {
  async run() {
    const loggerName = `[MuteOnEnter/${this.name}] `

    await this.zoomContext.runExclusive(async () => {
      await this.zoomContext.openMenu()
      await this.zoomContext.openParticipants()
      await this.zoomContext.mute()
      logger.info(loggerName + 'Successfully muted')
    })

    this.running = false
  }
}

export default MuteOnEnter
