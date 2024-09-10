import {Button, CustomSelect, FormItem, Link, Panel} from "@vkontakte/vkui";
import React, {FC, useEffect, useState} from "react";
import {Icon16CancelCircleOutline, Icon24ExternalLinkOutline} from "@vkontakte/icons";
import config from "../etc/config.json";
import {DeleteSlidesSheet, DeleteUserSettings, GetGroups, GetTeachers, SaveUserSettings} from "../api/api.ts";
import {Option, UserSettings} from "../types.ts";
import Loader from "../components/Loader.tsx";
import {Alert} from "@mui/material";
import {SetupResizeObserver} from "../utils/utils.tsx";
import {useRouteNavigator} from "@vkontakte/vk-mini-apps-router";

const Settings: FC<{
  id: string
  popout: React.ReactNode
  setPopout: (popout: React.ReactNode) => void
  userSettings: UserSettings | undefined
  setUserSettings: (userSettings: UserSettings) => void
  panelHeader: React.ReactNode
}> = ({id, popout, setPopout, userSettings, setUserSettings, panelHeader}) => {
  useEffect(() => SetupResizeObserver("settings_resize"), []);

  const routeNavigator = useRouteNavigator();

  const [tempUserSettings, setTempUserSettings] = useState(userSettings)

  const saveUserSettings = () => {
    if (tempUserSettings == undefined || popout != null) return
    setPopout(<Loader/>)
    setUserSettings(tempUserSettings)
    SaveUserSettings(tempUserSettings)
      .then(console.log)
      .catch(console.error)
      .finally(() => setPopout(null))
  }

  const deleteUserSettings = () => {
    if (popout != null) return
    setPopout(<Loader/>)
    DeleteUserSettings()
      .then(() => {
       DeleteSlidesSheet()
         .then(console.log)
         .catch(console.error)
         .finally(() => setPopout(null))
      })
      .catch(console.error)
  }

  const [groupOptions, setGroupOptions] = useState<Option[] | undefined>()
  const updateGroups = () => {
    setPopout(<Loader/>)
    GetGroups()
      .then(setGroupOptions)
      .catch(console.error)
      .finally(() => setPopout(null))
  }

  const changeGroup = (e: React.ChangeEvent<HTMLSelectElement>) => setTempUserSettings({
    ...tempUserSettings,
    teacher: "",
    group: e.target.value,
  } as UserSettings)

  const [teacherOptions, setTeacherOptions] = useState<Option[] | undefined>()
  const updateTeachers = () => {
    setPopout(<Loader/>)
    GetTeachers()
      .then(setTeacherOptions)
      .catch(console.error)
      .finally(() => setPopout(null))
  }

  const changeTeacher = (e: React.ChangeEvent<HTMLSelectElement>) => setTempUserSettings({
    ...tempUserSettings,
    teacher: e.target.value,
    group: "",
  } as UserSettings)

  const [subgroups,] = useState<Option[]>([
    {'label': '1 подгруппа', 'value': '1'},
    {'label': '2 подгруппа', 'value': '2'},
    {'label': '1 и 2 подгруппы', 'value': '1 и 2'},
  ])

  const changeSubgroup = (e: React.ChangeEvent<HTMLSelectElement>) => setTempUserSettings({
    ...tempUserSettings,
    subgroup: e.target.value,
  } as UserSettings)

  useEffect(() => {
    if (tempUserSettings) {
      if (tempUserSettings.group != "" && (!groupOptions || groupOptions.length == 0)) {
        updateGroups()
      } else if (tempUserSettings.teacher != "" && (!teacherOptions || teacherOptions.length == 0)) {
        updateTeachers()
      }
    }
  }, [JSON.stringify(tempUserSettings)]);

  const [type, setType] = useState<string | undefined>()
  useEffect(() => {
    if (tempUserSettings) {
      setType(tempUserSettings.group != "" ? config.texts.Group : config.texts.Teacher)
    } else {
      setType(undefined)
    }
  }, [tempUserSettings]);

  const changeType = (e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)

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
          children={userSettings && tempUserSettings
          && userSettings.teacher == tempUserSettings.teacher
          && userSettings.group == tempUserSettings.group
          && userSettings.subgroup == tempUserSettings.subgroup
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
            <FormItem noPadding>
              <CustomSelect
                placeholder={config.texts.SelectGroup}
                searchable
                options={groupOptions ?? []}
                onChange={changeGroup}
                value={tempUserSettings?.group}
                onOpen={groupOptions && groupOptions.length != 0 ? undefined : updateGroups}
                fetching={popout != null}
              />
            </FormItem>
            <FormItem noPadding>
              <CustomSelect
                disabled={!tempUserSettings || tempUserSettings.group == ""}
                placeholder={config.texts.SelectSubgroup}
                options={subgroups}
                onChange={changeSubgroup}
                value={tempUserSettings ? tempUserSettings.subgroup : "1 и 2"}
              />
            </FormItem>
          </>
          : <FormItem noPadding>
            <CustomSelect
              placeholder={config.texts.SelectTeacher}
              searchable
              options={teacherOptions ?? []}
              onChange={changeTeacher}
              value={tempUserSettings?.teacher}
              onOpen={teacherOptions && teacherOptions.length != 0 ? undefined : updateTeachers}
              fetching={popout != null}
            />
          </FormItem>
      )}

      <Alert
        variant="outlined"
        severity="info"
        style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
      >
        <div style={{marginBottom: '10px'}}>
          {config.texts.GroupOrTeacherNotFound} <Link
          href={config.group.href}
          target="_blank">{config.group.name}
          <Icon24ExternalLinkOutline width={16} height={16}/></Link>.
        </div>
        <div>
          {config.texts.Thanks}
        </div>
      </Alert>

      {(tempUserSettings == undefined
        || type == config.texts.Group && tempUserSettings.group == ""
        || type == config.texts.Teacher && tempUserSettings.teacher == "") && <Alert
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
        disabled={JSON.stringify(tempUserSettings) == JSON.stringify(userSettings) || tempUserSettings == undefined || (tempUserSettings.group == "" && tempUserSettings.teacher == "")}
        children={config.buttons.save}
      />

      {window.vk_user_id == 390295814 && <Button
        appearance='negative'
        align='center'
        mode='outline'
        stretched
        onClick={deleteUserSettings}
        disabled={userSettings == undefined || (userSettings.group == "" && userSettings.teacher == "")}
        children={config.buttons.clear}
      />}
    </div>
  </Panel>
};

export default Settings;