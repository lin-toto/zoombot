import Timeout from 'await-timeout'

import BasePlugin from '../base-plugin.js'
import logger from '../logger.js'

class AutoLeave extends BasePlugin {
  constructor (name, zoomContext, config) {
    super(name, zoomContext, config, {
      checkInterval: 60000,
      shouldStayForDurationRatio: undefined,
      leaveTriggerRatio: 0.5
    })

    this.maxParticipantsCount = 0
    this.startTime = new Date().getTime()

    if (this.config.shouldStayForDurationRatio && !this.zoomContext.config.duration) {
      throw new Error('Duration of the corresponding zoom context should be set')
    }
  }

  async run () {
    while (this.running) {
      await Timeout.set(this.config.checkInterval)

      let participantsCount
      await this.zoomContext.runExclusive(async () => {
        logger.debug(this.loggerName + 'Fetching participants count')
        await this.zoomContext.openMenu()
        participantsCount = await this.zoomContext.fetchParticipantsCount()
      })

      if (this.maxParticipantsCount < participantsCount) {
        this.maxParticipantsCount = participantsCount
        logger.info(this.loggerName + `Max participants count: ${this.maxParticipantsCount}`)
      }
      logger.debug(this.loggerName + `Participants count: ${participantsCount}/${this.maxParticipantsCount}`)

      if (!this.config.shouldStayForDurationRatio || !this.isInStayPeriod()) {
        if (participantsCount < this.maxParticipantsCount * this.config.leaveTriggerRatio) {
          logger.info(this.loggerName + 'Leave meeting...')
          await this.zoomContext.leave()
          this.running = false
          break
        }
      }
    }
  }

  isInStayPeriod () {
    return this.startTime + this.zoomContext.config.duration * this.config.shouldStayForDurationRatio >= new Date().getTime()
  }
}

export default AutoLeave
