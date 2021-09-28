import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug'
    }),
    new winston.transports.Console({
      level: 'error'
    })
  ]
})

export default logger
