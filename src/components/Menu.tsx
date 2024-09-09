import React, {FC} from "react";
import {Drawer} from "@mui/material";
import {SimpleCell, Subhead, Image, Footer} from "@vkontakte/vkui";
import {
  Icon28BankOutline,
  Icon28EducationOutline,
  Icon28InfoOutline,
  Icon28Notifications,
  Icon28SubscriptionsOutline,
  Icon28UserOutline,
  Icon28Users3Outline
} from "@vkontakte/icons";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import logo from "../assets/logo.png";
import config from "../etc/config.json"

const Menu: FC<{
  open: boolean
  setOpen: (open: boolean) => void
  select: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  mode: string
}> = ({open, setOpen, select, mode}) => <Drawer open={open} onClose={() => setOpen(false)}>
  <div className="hmtpk-drawer">
    <div className="hmtpk-drawer-header-block">
      <div>
        <Image src={logo} alt="ХМТПК Расписание" withTransparentBackground objectFit="contain" noBorder borderRadius={undefined} width="96px"/>
      </div>
      <Subhead className="hmtpk-drawer-header">
        Расписание Ханты-Мансийского технолого-педагогического колледжа
      </Subhead>
    </div>
    <div className="hmtpk-drawer-buttons">
      <SimpleCell
        before={<Icon28UserOutline
          fill={mode === DEFAULT_VIEW_PANELS.MySchedule
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.MySchedule}
        children={'Мое расписание'}
        disabled={mode === DEFAULT_VIEW_PANELS.MySchedule}
      />
      <SimpleCell
        before={<Icon28Users3Outline
          fill={mode === DEFAULT_VIEW_PANELS.GroupSchedule
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.GroupSchedule}
        children={'Группа'}
        disabled={mode === DEFAULT_VIEW_PANELS.GroupSchedule}
      />
      <SimpleCell
        before={<Icon28UserOutline
          fill={mode === DEFAULT_VIEW_PANELS.TeacherSchedule
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.TeacherSchedule}
        children={'Преподаватель'}
        disabled={mode === DEFAULT_VIEW_PANELS.TeacherSchedule}
      />
      <SimpleCell
        before={<Icon28Notifications
          fill={/*mode === DEFAULT_VIEW_PANELS.Announce ? "var(--vkui--color_icon_accent)" : */"var(--vkui--color_text_primary)"}/>}
        href={"https://hmtpk.ru/ru/press-center/announce/#textbody"}
        target="_blank"
        data-mode={DEFAULT_VIEW_PANELS.Announce}
        children={'Объявления'}
        disabled={mode === DEFAULT_VIEW_PANELS.Announce}
      />
      <SimpleCell
        before={<Icon28SubscriptionsOutline
          fill={/*mode === DEFAULT_VIEW_PANELS.Information ? "var(--vkui--color_icon_accent)" : */"var(--vkui--color_text_primary)"}/>}
        href={"https://hmtpk.ru/ru/press-center/news/#textbody"}
        target="_blank"
        data-mode={DEFAULT_VIEW_PANELS.News}
        children={'Новости'}
        disabled={mode === DEFAULT_VIEW_PANELS.News}
      />
      <SimpleCell
        before={<Icon28BankOutline
          fill={mode === DEFAULT_VIEW_PANELS.Information
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Information}
        children={'Колледж'}
        disabled={mode === DEFAULT_VIEW_PANELS.Information}
      />
      <SimpleCell
        before={<Icon28EducationOutline
          fill={mode === DEFAULT_VIEW_PANELS.Information
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Information}
        children={'Абитуриенту'}
        disabled={mode === DEFAULT_VIEW_PANELS.Information}
      />
      <SimpleCell
        before={<Icon28InfoOutline
          fill={mode === DEFAULT_VIEW_PANELS.Information
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Information}
        children={'О приложении'}
        disabled={mode === DEFAULT_VIEW_PANELS.Information}
      />
    </div>
    <Footer>{config.app.version}</Footer>
  </div>
</Drawer>

export default Menu;