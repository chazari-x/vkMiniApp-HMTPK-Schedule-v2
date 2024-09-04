import {FC, useEffect} from 'react';
import {Card, Link, Panel} from '@vkontakte/vkui';
import "@vkontakte/icons";
import {Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {SetupResizeObserver} from "../utils/utils.tsx";

const Information: FC<{
  id: string,
  panelHeader: React.ReactNode
}> = ({id, panelHeader}) => {
  useEffect(() => SetupResizeObserver("information_resize"), []);

  return (<Panel id={id}>
    {panelHeader}
    <div id="information_resize">
      <Card
        className='information_card'
        mode="outline-tint"
      >
        <div>
          {config.texts.Paragraph3}
        </div>
      </Card>
      <Card
        className='information_card'
        mode="outline-tint"
      >
        <div>
          {config.texts.Paragraph4}
        </div>
      </Card>
      <Card
        className='information_card'
        mode="outline-tint"
      >
        <div>
          <Link href={config.group.hrefs.vk} target="_blank">
            {config.group.name}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.Paragraph5}
        </div>
      </Card>
      <Card
        className='information_card'
        mode="outline-tint"
      >
        <div>
          <Link href='https://hmtpk.ru/' target="_blank">
            {config.links.link1}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.Paragraph6}
        </div>
      </Card>
    </div>
  </Panel>);
}

export default Information;