import {Button, CustomSelect, FormItem, Link, Panel} from "@vkontakte/vkui";
import React, {FC, HtmlHTMLAttributes, useEffect, useState} from "react";
import {Icon16CancelCircleOutline, Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {CloseApp, DeleteSlidesSheet, DeleteUserSettings, GetGroups, GetTeachers, SaveUserSettings} from "../api/api.ts";
import {Option, Subgroup, UserSettings} from "../types.ts";
import Loader from "../components/Loader.tsx";
import {Alert} from "@mui/material";
import {SetupResizeObserver} from "../utils/utils.tsx";
import {useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import NewAlert from "../components/Alert.tsx";

export interface Props {
  id: string;
  popout: React.ReactNode;
  setPopout: (popout: React.ReactNode) => void;
  userSettings: UserSettings | undefined;
  setUserSettings: (userSettings: UserSettings) => void;
  panelHeader: React.ReactNode;
}

const Settings: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, popout, setPopout, userSettings, setUserSettings, panelHeader} = props;

  useEffect(() => SetupResizeObserver("settings_resize"), []);

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();

  const saveUserSettings = () => {
    if (!group && !teacher || popout != null) return;
    setPopout(<Loader/>);
    setUserSettings({
      group: group ?? "",
      groupLabel: groupLabel ?? "",
      teacher: teacher ?? "",
      subgroup: subgroup ?? "1 и 2",
    });
    SaveUserSettings({
      group: group ?? "",
      groupLabel: groupLabel ?? "",
      teacher: teacher ?? "",
      subgroup: subgroup ?? "1 и 2",
    })
      .then(console.log)
      .catch(console.error)
      .finally(() => {
        setPopout(null)
        routeNavigator.replace("/")
      });
  };

  const deleteUserSettings = () => {
    if (popout != null) return;
    setPopout(<Loader/>);
    DeleteUserSettings()
      .then(() => {
        DeleteSlidesSheet()
          .then(() => CloseApp())
          .catch(console.error)
          .finally(() => setPopout(null))
      })
      .catch(console.error);
  };

  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const updateGroups = () => {
    setPopout(<Loader/>);
    GetGroups()
      .then(setGroupOptions)
      .catch(console.error)
      .finally(() => setPopout(null));
  };

  const [group, setGroup] = useState(userSettings?.group);
  const [groupLabel, setGroupLabel] = useState(userSettings?.groupLabel);
  const changeGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeacher("");
    setGroup(e.target.value);
    setGroupLabel(groupOptions?.find(option => option.value == e.target.value)?.label);
  };

  const [teacherOptions, setTeacherOptions] = useState<Option[]>([]);
  const updateTeachers = () => {
    setPopout(<Loader/>);
    GetTeachers()
      .then(setTeacherOptions)
      .catch(console.error)
      .finally(() => setPopout(null));
  };

  const [teacher, setTeacher] = useState(userSettings?.teacher);
  const changeTeacher = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroup("");
    setTeacher(e.target.value);
  };

  const [subgroups,] = useState<Option[]>([
    {'label': '1 подгруппа', 'value': '1'},
    {'label': '2 подгруппа', 'value': '2'},
    {'label': '1 и 2 подгруппы', 'value': '1 и 2'},
  ]);

  const [subgroup, setSubgroup] = useState(userSettings?.subgroup);
  const changeSubgroup = (e: React.ChangeEvent<HTMLSelectElement>) => setSubgroup(e.target.value as Subgroup);

  useEffect(() => {
    if (!!group && (!groupOptions || groupOptions.length == 0)) updateGroups();
    else if (!!teacher && (!teacherOptions || teacherOptions.length == 0)) updateTeachers();
  }, [group, teacher]);

  const [type, setType] = useState<string | undefined>();
  useEffect(() => {
    if (userSettings) setType(userSettings.group != "" ? config.texts.Group : config.texts.Teacher);
  }, []);

  useEffect(() => {
    if (!type) return;
    if (type == config.texts.Group) {
      setTeacher(userSettings?.teacher);
    } else {
      setGroup(userSettings?.group);
      setSubgroup(userSettings?.subgroup);
    }
  }, [type]);

  const changeType = (e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value);

  return <Panel id={id}>
    {panelHeader}
    <div id="settings_resize">
      <div className="selector_buttons">
        <Button
          disabled={userSettings == undefined || (userSettings.group == "" && userSettings.teacher == "")}
          appearance='negative'
          align="center"
          mode="outline"
          onClick={() => routeNavigator.replace("/")}
          before={<Icon16CancelCircleOutline/>}
          children={userSettings
          && userSettings.teacher == teacher
          && userSettings.group == group
          && userSettings.subgroup == subgroup
            ? config.buttons.close
            : config.buttons.cancelAndClose
          }
        />
      </div>

      <FormItem noPadding>
        <CustomSelect
          placeholder={config.texts.SelectUserType}
          value={type != undefined ? type : ""}
          onChange={changeType}
          options={[
            {label: config.texts.Group, value: config.texts.Group},
            {label: config.texts.Teacher, value: config.texts.Teacher}
          ]}
        />
      </FormItem>

      {type != undefined && (type == config.texts.Group
          ? <>
            <FormItem noPadding htmlFor="group_select">
              <CustomSelect
                id="group_select"
                placeholder={config.texts.SelectGroup}
                searchable
                allowClearButton
                options={groupOptions ?? []}
                onChange={changeGroup}
                value={group}
                onOpen={groupOptions && groupOptions.length != 0 ? undefined : updateGroups}
                fetching={popout != null}
              />
            </FormItem>
            <FormItem noPadding>
              <CustomSelect
                disabled={!group}
                placeholder={config.texts.SelectSubgroup}
                options={subgroups ?? []}
                onChange={changeSubgroup}
                value={subgroup ?? "1 и 2"}
              />
            </FormItem>
          </>
          : <FormItem noPadding>
            <CustomSelect
              placeholder={config.texts.SelectTeacher}
              searchable
              allowClearButton
              options={teacherOptions ?? []}
              onChange={changeTeacher}
              value={teacher}
              onOpen={teacherOptions && teacherOptions.length != 0 ? undefined : updateTeachers}
              fetching={popout != null}
            />
          </FormItem>
      )}

      <NewAlert
        severity="info"
        children={<>
          <div style={{marginBottom: '10px'}}>
            {config.texts.GroupOrTeacherNotFound} <Link
            href={config.group.href}
            target="_blank">{config.group.name}
            <Icon24ExternalLinkOutline width={16} height={16}/></Link>.
          </div>
          <div>
            {config.texts.Thanks}
          </div>
        </>}
      />

      {(type == config.texts.Group && !group
        || type == config.texts.Teacher && !teacher) && <Alert
        variant="outlined"
        severity="warning"
        style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
        children={config.errors.TeacherOrGroupIsNull}
      />}

      <Button
        appearance='positive'
        align='center'
        mode='outline'
        stretched
        onClick={saveUserSettings}
        disabled={(userSettings && userSettings.group == group && userSettings.teacher == teacher && userSettings.subgroup == subgroup) || (!group && !teacher)}
        children={config.buttons.save}
      />

      {params.get("tester") != undefined && <>
        <Button
          appearance='negative'
          align='center'
          mode='outline'
          stretched
          onClick={deleteUserSettings}
          disabled={userSettings == undefined || (userSettings.group == "" && userSettings.teacher == "")}
          children={config.buttons.clear}
        />
        <NewAlert
          severity="info"
          children={<div style={{marginBottom: '10px'}}>
            Эта кнопка очищает все данные. Нажмите ее, чтобы увидеть всё как новый пользователь.
          </div>}
        />
      </>}
    </div>
  </Panel>;
};

export default Settings;