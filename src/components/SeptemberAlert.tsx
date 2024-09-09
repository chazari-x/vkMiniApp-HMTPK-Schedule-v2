import {FC} from "react";
import {Alert} from "@mui/material";
import config from "../etc/config.json";
import {Link} from "@vkontakte/vkui";
import {Icon24ExternalLinkOutline} from "@vkontakte/icons";

const SeptemberAlert: FC<{ selectedDate: Date }> = ({selectedDate}) => {
  return selectedDate.getMonth() == 8 ? <Alert
    variant="outlined"
    severity="warning"
    style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
    children={<>
      {config.texts.SeptemberWarning} <Link
      href="https://hmtpk.ru/ru/students/old-timetable/"
      target="_blank"><span style={{textWrap: 'nowrap',}}>ссылке
                    <Icon24ExternalLinkOutline width={16} height={16}/></span></Link>.
    </>}
  /> : null
}

export default SeptemberAlert;