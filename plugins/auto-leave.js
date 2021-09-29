import Timeout from "await-timeout";

import BasePlugin from "../base-plugin.js";
import logger from "../logger.js";

class AutoLeave extends BasePlugin {
  constructor(name, ctx, config) {
    super(name, ctx, config, {});
    this.maxParticipantsCount = 0;
    this.participantsCount = 0;
  }

  async run() {
    while (this.running) {
      await this.zoomContext.runExclusive(async () => {
        logger.debug(this.loggerName + "Fetch participants count");
        await this.zoomContext.openParticipants();
        this.participantsCount =
          await this.zoomContext.fetchParticipantsCount();
        this.maxParticipantsCount = Math.max(
          this.maxParticipantsCount,
          this.participantsCount
        );
      });
      logger.info(
        this.loggerName +
          "Participants count:" +
          String(this.participantsCount) +
          "/" +
          String(this.maxParticipantsCount)
      );
      if (this.participantsCount < Math.ceil(this.maxParticipantsCount / 2)) {
        logger.debug(this.loggerName + "Leave metting...");
        await this.zoomContext.leave();
        break;
      }
      await Timeout.set(5000);
    }
  }
}

export default AutoLeave;
