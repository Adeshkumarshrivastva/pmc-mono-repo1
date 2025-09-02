import pino from 'pino'
import pretty from 'pino-pretty'

const _logger = pino(pretty({ ignore: 'pid,hostname' }))

export function createLogger(moduleName: string) {
  return _logger.child({}, { msgPrefix: `\t${padSpaces(`[${moduleName}]`, 15)} ` })
}

function padSpaces(str: string, len: number) {
  if (str.length > len) {
    return str
  }
  const spaces = len - str.length
  return `${str}${Array.from({ length: spaces }).fill(' ').join('')}`
}

export const rootLogger = createLogger('pmc-server')
