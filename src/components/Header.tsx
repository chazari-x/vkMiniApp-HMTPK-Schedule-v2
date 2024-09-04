import {FC, Fragment, useEffect, useState} from "react";
import {IconButton, PanelHeader, PanelHeaderContext, SimpleCell} from "@vkontakte/vkui";
import {Icon24Done, Icon28Menu, Icon28SettingsOutline, Icon28UsersOutline} from "@vkontakte/icons";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import {useActiveVkuiLocation} from "@vkontakte/vk-mini-apps-router";

const Header: FC<{
  disabled?: boolean | undefined
  contextOpened: boolean
  toggleContext: () => void
  select: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}> = ({disabled, contextOpened, toggleContext, select}) => {
  const [mode, setMode] = useState<string>('')

  const {panel} = useActiveVkuiLocation();

  useEffect(() => {
    if (panel == undefined || ([
      DEFAULT_VIEW_PANELS.GroupSelector,
      DEFAULT_VIEW_PANELS.TeacherSelector,
      DEFAULT_VIEW_PANELS.Settings
    ] as string[]).includes(panel)) return
    setMode(panel)
  }, [panel]);

  return <Fragment>
    <PanelHeader before={<IconButton disabled={disabled} onClick={toggleContext}><Icon28Menu/></IconButton>}>
      Расписание
    </PanelHeader>
    <PanelHeaderContext opened={contextOpened} onClose={toggleContext}>
      <SimpleCell
        before={<Icon28UsersOutline/>}
        after={mode === DEFAULT_VIEW_PANELS.MySchedule ? <Icon24Done fill="var(--vkui--color_icon_accent)"/> : null}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.MySchedule}
        children={'Мое расписание'}
      />
      <SimpleCell
        before={<Icon28SettingsOutline/>}
        after={
          mode === DEFAULT_VIEW_PANELS.GroupSchedule ? <Icon24Done fill="var(--vkui--color_icon_accent)"/> : null
        }
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.GroupSchedule}
        children={'Расписание группы'}
      />
      <SimpleCell
        before={<Icon28SettingsOutline/>}
        after={
          mode === DEFAULT_VIEW_PANELS.TeacherSchedule ? <Icon24Done fill="var(--vkui--color_icon_accent)"/> : null
        }
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.TeacherSchedule}
        children={'Расписание преподавателя'}
      />
      <SimpleCell
        before={<Icon28SettingsOutline/>}
        after={
          mode === DEFAULT_VIEW_PANELS.Information ? <Icon24Done fill="var(--vkui--color_icon_accent)"/> : null
        }
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Information}
        children={'Информация'}
      />
    </PanelHeaderContext>
  </Fragment>
}

export default Header;