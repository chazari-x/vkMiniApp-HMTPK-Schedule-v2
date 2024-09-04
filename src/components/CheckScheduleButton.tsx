import {Button} from "@vkontakte/vkui";
import {Icon24CalendarOutline, Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {FC} from "react";
import {Schedule} from "../types.ts";

const CheckScheduleButton: FC<{
  dayNum: number | undefined
  schedule: Schedule[] | undefined
}> = ({dayNum, schedule}) => {
  return dayNum !== undefined && schedule !== undefined && schedule[dayNum] !== undefined ? (
    <Button
      align="center"
      appearance='accent-invariable'
      mode="outline"
      className="hmtpk-button"
      stretched={true}
      href={schedule[dayNum].href.replace(/&amp;/g, '&')}
      target="_blank"
      before={<Icon24CalendarOutline width={16} height={16}/>}
      after={<Icon24ExternalLinkOutline width={16} height={16}/>}
      children={config.texts.CheckSchedule}
    />
  ) : null
}

export default CheckScheduleButton;