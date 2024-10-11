import {ReactNode, useEffect, useState} from 'react';
import {Epic, SplitCol, SplitLayout} from '@vkontakte/vkui';
import {useActiveVkuiLocation, useRouteNavigator} from '@vkontakte/vk-mini-apps-router';
import {DEFAULT_VIEW_PANELS} from './routes';
import Loader from "./components/Loader.tsx";
import {Option, UserSettings} from "./types.ts";
import {GetUserSettings} from "./api/api.ts";
import config from "./etc/config.json";
import Header from "./components/Header.tsx";
import Menu from "./components/Menu.tsx";
import Announces from "./lazy/Announces.tsx";
import Abitur from "./lazy/Abitur.tsx";
import College from "./lazy/College.tsx";
import Information from "./lazy/Information.tsx";
import TeacherSelector from "./lazy/TeacherSelector.tsx";
import TeacherSchedule from "./lazy/TeacherSchedule.tsx";
import GroupSelector from "./lazy/GroupSelector.tsx";
import GroupSchedule from "./lazy/GroupSchedule.tsx";
import Settings from "./lazy/Settings.tsx";
import MySchedule from "./lazy/MySchedule.tsx";
import {getUTC3Date} from "./utils/utils.tsx";

export const App = () => {
  const {panel: activePanel = DEFAULT_VIEW_PANELS.MySchedule} = useActiveVkuiLocation();

  const routeNavigator = useRouteNavigator();

  const [popout, setPopout] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (fetched && (!userSettings || (!userSettings.teacher && (!userSettings.group || !userSettings.groupLabel))) && activePanel == DEFAULT_VIEW_PANELS.MySchedule) routeNavigator.push(`/${DEFAULT_VIEW_PANELS.Settings}`)
  }, [activePanel]);

  const [groupOption, setGroupOption] = useState<Option | undefined>()
  const [subgroup, setSubgroup] = useState<string>('1 и 2')
  const [teacherOption, setTeacherOption] = useState<Option | undefined>()
  const [userSettings, setUserSettings] = useState<UserSettings | undefined>()
  const [fetched, setFetched] = useState(false)
  useEffect(() => {
    setPopout(<Loader/>)
    GetUserSettings()
      .then((userSettings) => {
        setUserSettings(userSettings)
        if ((!userSettings || (!userSettings.teacher && (!userSettings.group || !userSettings.groupLabel))) && activePanel == DEFAULT_VIEW_PANELS.MySchedule)
          routeNavigator.push('/settings')
      })
      .catch(err => {
        console.error(err)
        if (activePanel == DEFAULT_VIEW_PANELS.MySchedule) routeNavigator.push('/settings')
        setUserSettings({
          teacher: "",
          group: "",
          subgroup: "1 и 2",
        } as UserSettings)
      })
      .finally(() => {
        setPopout(null)
        setFetched(true)
      })
  }, []);

  const [contextOpened, setContextOpened] = useState(false);
  const toggleContext = () => setContextOpened((prev) => !prev);

  const select = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const mode = e.currentTarget.dataset.mode;
    if (mode == DEFAULT_VIEW_PANELS.MySchedule) routeNavigator.push(`/`);
    else routeNavigator.push(`/${mode}`);
    requestAnimationFrame(toggleContext);
  };

  const [mode, setMode] = useState<string>('')

  const {panel} = useActiveVkuiLocation();

  const [maxDate,] = useState(getUTC3Date((getUTC3Date()).setMonth((getUTC3Date()).getMonth() + 1)))
  const [minDate,] = useState(getUTC3Date((getUTC3Date()).setFullYear((getUTC3Date()).getFullYear() - 10)))

  useEffect(() => {
    if (fetched && (!userSettings || (!userSettings.teacher && (!userSettings.group || !userSettings.groupLabel))) && panel == DEFAULT_VIEW_PANELS.MySchedule) {
      setHeader(config.pages.Settings)
      setMode(panel)
      routeNavigator.push(`/${DEFAULT_VIEW_PANELS.Settings}`)
    }

    if (panel == undefined || ([
      DEFAULT_VIEW_PANELS.GroupSelector,
      DEFAULT_VIEW_PANELS.TeacherSelector,
      DEFAULT_VIEW_PANELS.Settings
    ] as string[]).includes(panel)) return

    switch (panel) {
      case DEFAULT_VIEW_PANELS.Information:
        setHeader(config.pages.Information)
        break
      case DEFAULT_VIEW_PANELS.Settings:
        setHeader(config.pages.Settings)
        break
      case DEFAULT_VIEW_PANELS.Announce:
        setHeader(config.pages.Announce)
        break
      case DEFAULT_VIEW_PANELS.News:
        setHeader(config.pages.News)
        break
      case DEFAULT_VIEW_PANELS.College:
        setHeader(config.pages.College)
        break
      case DEFAULT_VIEW_PANELS.Abitur:
        setHeader(config.pages.Abitur)
        break
      default:
        setHeader(config.pages.Schedule)
    }

    setMode(panel)
  }, [panel]);

  const [header, setHeader] = useState(config.pages.Schedule)

  return (
    <SplitLayout popout={popout}>
      <SplitCol>
        <Menu open={contextOpened} setOpen={toggleContext} select={select} mode={mode}/>
        {userSettings && <Epic activeStory={activePanel}>
          <MySchedule
            id={DEFAULT_VIEW_PANELS.MySchedule}
            userSettings={userSettings}
            setPopout={setPopout}
            popout={popout}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            minDate={minDate}
            maxDate={maxDate}
          />
          <Settings
            id={DEFAULT_VIEW_PANELS.Settings}
            popout={popout}
            setPopout={setPopout}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
          />
          <GroupSchedule
            id={DEFAULT_VIEW_PANELS.GroupSchedule}
            popout={popout}
            setPopout={setPopout}
            option={groupOption}
            setOption={setGroupOption}
            subgroup={subgroup}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            minDate={minDate}
            maxDate={maxDate}
          />
          <GroupSelector
            id={DEFAULT_VIEW_PANELS.GroupSelector}
            setPopout={setPopout}
            option={groupOption}
            setOption={setGroupOption}
            subgroup={subgroup}
            setSubgroup={setSubgroup}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
          />
          <TeacherSchedule
            id={DEFAULT_VIEW_PANELS.TeacherSchedule}
            popout={popout}
            setPopout={setPopout}
            option={teacherOption}
            setOption={setTeacherOption}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            minDate={minDate}
            maxDate={maxDate}
          />
          <TeacherSelector
            id={DEFAULT_VIEW_PANELS.TeacherSelector}
            setPopout={setPopout}
            option={teacherOption}
            setOption={setTeacherOption}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
          />
          <Information
            id={DEFAULT_VIEW_PANELS.Information}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            setPopout={setPopout}
          />
          <College
            id={DEFAULT_VIEW_PANELS.College}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            setPopout={setPopout}
          />
          <Abitur
            id={DEFAULT_VIEW_PANELS.Abitur}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
            setPopout={setPopout}
          />
          <Announces
            id={DEFAULT_VIEW_PANELS.Announce}
            popout={popout}
            setPopout={setPopout}
            panelHeader={<Header header={header} toggleContext={toggleContext}/>}
          />
        </Epic>}
      </SplitCol>
    </SplitLayout>
  );
};
