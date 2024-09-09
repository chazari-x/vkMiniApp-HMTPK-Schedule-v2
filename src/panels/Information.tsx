import {FC, ReactNode, useEffect} from 'react';
import {Card, Link, Panel} from '@vkontakte/vkui';
import "@vkontakte/icons";
import {Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {SetupResizeObserver} from "../utils/utils.tsx";

const Information: FC<{
  id: string,
  panelHeader: ReactNode
}> = ({id, panelHeader}) => {
  useEffect(() => SetupResizeObserver("information_resize"), []);

  return <Panel id={id}>
    {panelHeader}
    <div id="information_resize">
      <Card
        className='information_card'
        mode="outline-tint"
        children={<div>{config.texts.AppInformation}</div>}
      />
      <Card
        className='information_card'
        mode="outline-tint"
        children={<div>{config.texts.CheckScheduleOnSite}</div>}
      />
      <Card
        className='information_card'
        mode="outline-tint"
        children={<div>{config.texts.HowUseApplication}</div>}
      />
      <Card
        className='information_card'
        mode="outline-tint"
        children={<div>
          <Link href={config.group.href} target="_blank">
            {config.group.name}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.ErrorsOrInaccuracies}
        </div>}
      />
      <Card
        className='information_card'
        mode="outline-tint"
        children={<div>
          <Link href='https://hmtpk.ru/' target="_blank">
            {config.texts.OfficialCollegeSite}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.OfficialSource}
        </div>}
      />
    </div>
  </Panel>
}

export default Information;