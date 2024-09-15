import {FC} from "react";
import {Button} from "@vkontakte/vkui";
import {Icon24ShareOutline} from "@vkontakte/icons";
import config from "../etc/config.json";

const ShareButton: FC<{
  title: string | undefined
  link: string | undefined
  comment: string | undefined
}> = ({title, link, comment}) => <Button
  align="center"
  appearance='accent-invariable'
  mode="outline"
  className="hmtpk-button"
  stretched={true}
  disabled={title == undefined || link == undefined && comment == undefined}
  href={title != undefined && link != undefined && comment != undefined
    ? `https://vk.com/share.php?title=${encodeURIComponent(title)}&comment=${encodeURIComponent(comment)}&url=${encodeURIComponent(link)}`
    : undefined}
  target="_blank"
  before={<Icon24ShareOutline width={16} height={16}/>}
  children={config.texts.Share}
/>

export default ShareButton;