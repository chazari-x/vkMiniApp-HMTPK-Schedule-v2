import {FC, HtmlHTMLAttributes, ReactNode, useEffect} from 'react';
import {Link, Panel, Paragraph, Separator} from '@vkontakte/vkui';
import "@vkontakte/icons";
import {Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {SetupResizeObserver} from "../utils/utils.tsx";

export interface Props {
  id: string;
  panelHeader: ReactNode;
}

const Information: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, panelHeader} = props;

  useEffect(() => SetupResizeObserver("information_resize"), []);

  return <Panel id={id}>
    {panelHeader}
    <div id="information_resize">
      <Paragraph
        children={<div>{config.texts.AppInformation}</div>}
      />
      <Separator/>
      <Paragraph
        children={<div>{config.texts.CheckScheduleOnSite}</div>}
      />
      <Separator/>
      <Paragraph
        children={<div>{config.texts.HowUseApplication}</div>}
      />
      <Separator/>
      <Paragraph
        children={<div>
          <Link href={config.group.href} target="_blank">
            {config.group.name}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.ErrorsOrInaccuracies}
        </div>}
      />
      <Separator/>
      <Paragraph
        children={<div>
          <Link href='https://hmtpk.ru/' target="_blank">
            {config.texts.OfficialCollegeSite}<Icon24ExternalLinkOutline width={16} height={16}/>
          </Link> {config.texts.OfficialSource}
        </div>}
      />
      <Separator/>
      <Paragraph
        children={<div>{config.texts.SchedulePreparedIn1c}</div>}
      />
      <Separator/>
      <div className="hmtpk-footer">
        Х М Т П К
      </div>
    </div>
  </Panel>;
};

export default Information;