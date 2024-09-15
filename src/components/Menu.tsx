import React, {FC} from "react";
import {Drawer} from "@mui/material";
import {Card, Footer, Image, SimpleCell, Subhead} from "@vkontakte/vkui";
import {
  Icon28BankOutline,
  Icon28CalendarOutline,
  Icon28EducationOutline,
  Icon28InfoOutline,
  Icon28Notifications,
  Icon28SubscriptionsOutline
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
        <Image src={logo} alt={config.app.shortName} withTransparentBackground objectFit="contain" noBorder
               borderRadius={undefined} width="96px"/>
      </div>
      <Subhead className="hmtpk-drawer-header" children={config.app.longName}/>
    </div>
    <div className="hmtpk-drawer-buttons">
      <Card mode="outline-tint" className="hmtpk-drawer-buttons-block">
        <Subhead className="hmtpk-drawer-header" children={config.pages.Schedule}/>
        <SimpleCell
          before={<Icon28CalendarOutline
            fill={mode === DEFAULT_VIEW_PANELS.MySchedule
              ? "var(--vkui--color_icon_accent)"
              : "var(--vkui--color_text_primary)"}
          />}
          onClick={select}
          data-mode={DEFAULT_VIEW_PANELS.MySchedule}
          children={config.pages.MySchedule}
          disabled={mode === DEFAULT_VIEW_PANELS.MySchedule}
        />
        <SimpleCell
          before={<Icon28CalendarOutline
            fill={mode === DEFAULT_VIEW_PANELS.GroupSchedule
              ? "var(--vkui--color_icon_accent)"
              : "var(--vkui--color_text_primary)"}
          />}
          onClick={select}
          data-mode={DEFAULT_VIEW_PANELS.GroupSchedule}
          children={config.pages.GroupSchedule}
          disabled={mode === DEFAULT_VIEW_PANELS.GroupSchedule}
        />
        <SimpleCell
          before={<Icon28CalendarOutline
            fill={mode === DEFAULT_VIEW_PANELS.TeacherSchedule
              ? "var(--vkui--color_icon_accent)"
              : "var(--vkui--color_text_primary)"}
          />}
          onClick={select}
          data-mode={DEFAULT_VIEW_PANELS.TeacherSchedule}
          children={config.pages.TeacherSchedule}
          disabled={mode === DEFAULT_VIEW_PANELS.TeacherSchedule}
        />
      </Card>

      <SimpleCell
        before={<Icon28Notifications
          fill={mode === DEFAULT_VIEW_PANELS.Announce ? "var(--vkui--color_icon_accent)" : "var(--vkui--color_text_primary)"}/>}
        href={"https://hmtpk.ru/ru/press-center/announce/#textbody"}
        target="_blank"
        // onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Announce}
        children={config.pages.Announce}
        disabled={mode === DEFAULT_VIEW_PANELS.Announce}
      />
      <SimpleCell
        before={<Icon28SubscriptionsOutline
          fill={mode === DEFAULT_VIEW_PANELS.Information ? "var(--vkui--color_icon_accent)" : "var(--vkui--color_text_primary)"}/>}
        href={"https://hmtpk.ru/ru/press-center/news/#textbody"}
        target="_blank"
        // onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.News}
        children={config.pages.News}
        disabled={mode === DEFAULT_VIEW_PANELS.News}
      />
      <SimpleCell
        before={<Icon28BankOutline
          fill={mode === DEFAULT_VIEW_PANELS.College
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.College}
        children={config.pages.College}
        disabled={mode === DEFAULT_VIEW_PANELS.College}
      />
      <SimpleCell
        before={<Icon28EducationOutline
          fill={mode === DEFAULT_VIEW_PANELS.Abitur
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Abitur}
        children={config.pages.Abitur}
        disabled={mode === DEFAULT_VIEW_PANELS.Abitur}
      />
      <SimpleCell
        before={<Icon28InfoOutline
          fill={mode === DEFAULT_VIEW_PANELS.Information
            ? "var(--vkui--color_icon_accent)"
            : "var(--vkui--color_text_primary)"}
        />}
        onClick={select}
        data-mode={DEFAULT_VIEW_PANELS.Information}
        children={config.pages.Information}
        disabled={mode === DEFAULT_VIEW_PANELS.Information}
      />
    </div>
    <Footer>{config.app.version}</Footer>
  </div>
</Drawer>

export default Menu;