import cron from 'node-cron'
import { Table } from 'console-table-printer'

import config from './config.js'
import Zoom from './zoom.js'
import logger from './logger.js'

async function launchMeeting (meeting) {
  const loggerName = `[Main/${meeting.name}] `

  try {
    const zoom = new Zoom(meeting.name, meeting.zoomConfig)
    logger.debug(loggerName + `Created zoom instance for meeting`)
    await zoom.join()
    logger.info(loggerName + `Successfully joined meeting`)

    for (const pluginConfig of meeting.plugins) {
      const plugin = new pluginConfig.plugin(meeting.name, zoom, pluginConfig.config)
      logger.debug(loggerName + `Created ${pluginConfig.name}`)
      const pluginPromise = plugin.run()
      logger.info(loggerName + `Started ${pluginConfig.name}`)

      pluginPromise.then(() => {
        if (plugin.running) {
          logger.warn(loggerName + `${pluginConfig.name} terminated unexpectedly`)
        } else {
          logger.info(loggerName + `${pluginConfig.name} terminated successfully`)
        }
      }).catch(e => {
        logger.error(loggerName + `${pluginConfig.name} terminated with exception`)
        logger.error(e)
      })
    }
  } catch (e) {
    logger.error(loggerName + `Unexpected error occurred:`)
    logger.error(e)
  }
}

async function printTasks (config) {
  logger.info("[Main] Registered tasks:")
  const table = new Table();
  table.addRows(config.map(meeting => {
    return {
      name: meeting.name,
      schedule: meeting.cron ? meeting.cron : 'Immediate',
      meetingId: meeting.meetingId,
      plugins: meeting.plugins.map(plugin => plugin.name).join(', ')
    }
  }))

  table.printTable()
}

async function main () {
  printTasks(config)

  for (const meeting of config) {
    if (meeting.cron) {
      logger.debug(`[Main] Registered meeting cron job ` + meeting.name)
      cron.schedule(meeting.cron, async () => await launchMeeting(meeting), {})
    } else {
      logger.debug(`[Main] Launching immediate job ` + meeting.name)
      await launchMeeting(meeting)
    }
  }
}

await main()
