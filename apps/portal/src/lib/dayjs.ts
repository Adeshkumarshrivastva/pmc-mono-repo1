import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import minMax from 'dayjs/plugin/minMax'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'

const plugins = [customParseFormat, localizedFormat, utc, timezone, isoWeek, minMax, duration]
for (const plugin of plugins) {
  dayjs.extend(plugin)
}
export default dayjs
