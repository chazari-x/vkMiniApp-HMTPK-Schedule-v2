import {FC} from "react";
import config from "../etc/config.json";
import {Link} from "@vkontakte/vkui";
import {Icon24ExternalLinkOutline} from "@vkontakte/icons";
import NewAlert from "./Alert.tsx";
import {MergedLesson, Schedule} from "../types.ts";

const SeptemberAlert: FC<{
  selectedDate: Date
  schedule: Schedule[] | undefined
  dayNum: number | undefined
  mergedLessons: MergedLesson[] | undefined
}> = ({selectedDate, schedule, dayNum, mergedLessons}) => {
  return selectedDate.getMonth() == 8 && schedule && dayNum != undefined && !schedule[dayNum].lesson?.length && mergedLessons != undefined
    ? <NewAlert
      severity="warning"
      children={<>
        {config.texts.SeptemberWarning} <Link
        href="https://hmtpk.ru/ru/students/old-timetable/"
        target="_blank"><span style={{textWrap: 'nowrap',}}>ссылке
                    <Icon24ExternalLinkOutline width={16} height={16}/></span></Link>.
      </>}
    /> : null
}

export default SeptemberAlert;