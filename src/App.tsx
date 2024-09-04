import {ReactNode, useEffect, useState} from 'react';
import {SplitCol, SplitLayout, View} from '@vkontakte/vkui';
import {useActiveVkuiLocation, useRouteNavigator} from '@vkontakte/vk-mini-apps-router';
import {DEFAULT_VIEW_PANELS} from './routes';
import MySchedule from "./panels/MySchedule.tsx";
import Loader from "./components/Loader.tsx";
import Information from "./panels/Information.tsx";
import {Option, UserSettings} from "./types.ts";
import {GetUserSettings} from "./api/api.ts";
import Settings from "./panels/Settings.tsx";
import Header from "./components/Header.tsx";
import GroupSchedule from "./panels/GroupSchedule.tsx";
import GroupSelector from "./panels/GroupSelector.tsx";
import TeacherSchedule from "./panels/TeacherSchedule.tsx";
import TeacherSelector from "./panels/TeacherSelector.tsx";

export const App = () => {
  const {panel: activePanel = DEFAULT_VIEW_PANELS.MySchedule} = useActiveVkuiLocation();

  const routeNavigator = useRouteNavigator();

  const [popout, setPopout] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (fetched && !userSettings && activePanel != DEFAULT_VIEW_PANELS.Settings) routeNavigator.push(`/${DEFAULT_VIEW_PANELS.Settings}`)
  }, [activePanel]);

  const [groupOption, setGroupOption] = useState<Option | undefined>()
  const [subgroup, setSubgroup] = useState<string>('1 и 2')
  const [teacherOption, setTeacherOption] = useState<Option | undefined>()
  const [userSettings, setUserSettings] = useState<UserSettings | undefined>()
  const [fetched, setFetched] = useState(false)
  useEffect(() => {
    setPopout(<Loader/>)
    GetUserSettings()
      .then(setUserSettings)
      .catch(err => {
        console.error(err)
        routeNavigator.push('/settings')
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

  return (
    <SplitLayout popout={popout}>
      <SplitCol>
        {userSettings && <View activePanel={activePanel}>
          <MySchedule
            id={DEFAULT_VIEW_PANELS.MySchedule}
            userSettings={userSettings}
            setPopout={setPopout}
            popout={popout}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
          <Settings
            id={DEFAULT_VIEW_PANELS.Settings}
            popout={popout}
            setPopout={setPopout}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}
                                 disabled={userSettings.teacher == "" && userSettings.group == ""}/>}
          />
          <GroupSchedule
            id={DEFAULT_VIEW_PANELS.GroupSchedule}
            popout={popout}
            setPopout={setPopout}
            option={groupOption}
            setOption={setGroupOption}
            subgroup={subgroup}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
          <GroupSelector
            id={DEFAULT_VIEW_PANELS.GroupSelector}
            setPopout={setPopout}
            option={groupOption}
            setOption={setGroupOption}
            subgroup={subgroup}
            setSubgroup={setSubgroup}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
          <TeacherSchedule
            id={DEFAULT_VIEW_PANELS.TeacherSchedule}
            popout={popout}
            setPopout={setPopout}
            option={teacherOption}
            setOption={setTeacherOption}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
          <TeacherSelector
            id={DEFAULT_VIEW_PANELS.TeacherSelector}
            setPopout={setPopout}
            option={teacherOption}
            setOption={setTeacherOption}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
          <Information
            id={DEFAULT_VIEW_PANELS.Information}
            panelHeader={<Header select={select} contextOpened={contextOpened} toggleContext={toggleContext}/>}
          />
        </View>}
      </SplitCol>
    </SplitLayout>
  );
};
