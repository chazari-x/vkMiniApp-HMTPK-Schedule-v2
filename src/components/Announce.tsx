import {FC} from "react";
import {Button, Skeleton, Subhead, Title} from "@vkontakte/vkui";
import {Announce as AnnounceType} from "../types.ts";
import {Icon16ShareOutline, Icon24ExternalLinkOutline} from "@vkontakte/icons";

export const Announce: FC<{
  announce: AnnounceType
}> = ({announce}) => <div className="announce_element" key={announce.path}>
  <div className="announce_header">
    <Subhead className="announce_date">{announce.date}</Subhead>
    <Button
      appearance="accent-invariable"
      mode="link"
      // target="_blank"
      // href={`https://hmtpk.ru${announce.path}`}
      after={<Icon16ShareOutline/>}
    >Поделиться</Button>
  </div>
  <Title level="2" className="announce_title">{announce.title}</Title>
  <div className="announce_body" dangerouslySetInnerHTML={{__html: announce.body}}/>
  <div className="announce_button">
    <Button
      appearance="accent-invariable"
      mode="link"
      target="_blank"
      after={<Icon24ExternalLinkOutline width={16} height={16}/>}
      href={`https://hmtpk.ru${announce.path}`}
    >Подробнее на сайте колледжа</Button>
  </div>
</div>

export const AnnounceSkeleton: FC<{
  key: number | string
}> = ({key}) => <div className="announce_element" key={key}>
  <div className="announce_header">
    <Subhead className="announce_date"><Skeleton width="80px"/></Subhead>
    <Button
      disabled
      appearance="accent-invariable"
      mode="link"
      after={<Icon16ShareOutline/>}
    >Поделиться</Button>
  </div>
  <Title level="2" className="announce_title"><Skeleton width="100%" height="24px"/></Title>
  <div>
    <Skeleton width="100%"/>
    <Skeleton width="100%"/>
    <Skeleton width="30%"/>
  </div>
  <div>
    <Skeleton width="100%"/>
    <Skeleton width="70%"/>
  </div>
  <div className="announce_button">
    <Button
      disabled
      appearance="accent-invariable"
      mode="link"
      after={<Icon24ExternalLinkOutline width={16} height={16}/>}
    >Подробнее на сайте колледжа</Button>
  </div>
</div>