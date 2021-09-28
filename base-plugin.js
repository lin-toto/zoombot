import { merge } from 'lodash-es'

class BasePlugin {
  constructor (name, zoomContext, config, defaultConfig) {
    if (new.target === BasePlugin) {
      throw new TypeError('Cannot construct BasePlugin')
    }

    if (!defaultConfig) {
      defaultConfig = {}
    }

    this.name = name
    this.zoomContext = zoomContext
    this.config = merge(defaultConfig, config)
    this.running = true
  }

  async run () {}
}

export default BasePlugin
