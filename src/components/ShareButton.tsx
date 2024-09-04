import {FC} from "react";
import {Button} from "@vkontakte/vkui";
import {Icon24ShareOutline} from "@vkontakte/icons";
import config from "../etc/config.json";

const ShareButton: FC<{
  title: string | undefined
  link: string | undefined
}> = ({title, link}) => <div style={{
  display: "flex",
  flexDirection: "row",
  justifyContent: "right",
  position: "relative"
}}>
  {title != undefined && link != undefined && <Button
    align="center"
    appearance='accent-invariable'
    mode="outline"
    className="hmtpk-button"
    stretched={true}
    href={`https://vk.com/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`}
    target="_blank"
    before={<Icon24ShareOutline width={16} height={16}/>}
    children={config.texts.Share}
  />}
</div>

export default ShareButton;