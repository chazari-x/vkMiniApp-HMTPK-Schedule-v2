import React, {FC, useEffect, useState} from "react";
import {Button, Cell, CustomSelect, Footer, FormItem, Panel, Search} from "@vkontakte/vkui";
import {Icon16CancelCircleOutline, Icon24Done} from "@vkontakte/icons";
import config from "../etc/config.json";
import {useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {Option} from "../types.ts";
import Loader from "../components/Loader.tsx";
import {GetGroups} from "../api/api.ts";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import {SetupResizeObserver} from "../utils/utils.tsx";

const GroupSelector: FC<{
  id: string,
  option: Option | undefined
  setOption: (option: Option) => void
  subgroup: string
  setSubgroup: (subgroup: string) => void
  panelHeader: React.ReactNode
  setPopout: (popout: React.ReactNode) => void
}> = ({id, option, setOption, subgroup, setSubgroup, panelHeader, setPopout}) => {
  useEffect(() => {
    SetupResizeObserver("group_selector_resize")
  }, []);

  const routeNavigator = useRouteNavigator();

  const [selectedDate,] = useState(new Date())

  const [options, setOptions] = useState<Option[] | undefined>()
  const updateGroups = () => {
    setPopout(<Loader/>)
    GetGroups()
      .then(setOptions)
      .catch(console.error)
      .finally(() => setPopout(null))
  }

  useEffect(() => {
    updateGroups()
  }, []);

  const [search, setSearch] = React.useState('');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const thematicsFiltered = options?.filter(
    ({label}) => label.toLowerCase().indexOf(search.toLowerCase()) > -1,
  );

  const [subgroups,] = useState<Option[]>([
    {'label': '1 подгруппа', 'value': '1'},
    {'label': '2 подгруппа', 'value': '2'},
    {'label': '1 и 2 подгруппы', 'value': '1 и 2'},
  ])

  return <Panel id={id}>
    {panelHeader}
    <div id="group_selector_resize">
      <div className="selector_buttons">
        <Button
          appearance='negative' align="center" mode="outline"
          onClick={() => routeNavigator.back()}
          before={<Icon16CancelCircleOutline/>}
        >{config.buttons.close}</Button>
      </div>

      <div className="selector_body">
        <FormItem noPadding>
          <CustomSelect
            placeholder="Выберите подгруппу" options={subgroups}
            onChange={event => setSubgroup(event.target.value)}
            value={subgroup}
          />
        </FormItem>
        <Search value={search} onChange={onChange} after={null} noPadding/>
        <div>
          {thematicsFiltered && (thematicsFiltered.length > 0
            ? thematicsFiltered.map((o) =>
              <Cell
                key={o.value}
                onClick={() => {
                  setOption(o)
                  routeNavigator.replace(`/${DEFAULT_VIEW_PANELS.GroupSchedule}?day=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}&value=${o.value}`)
                }}
                after={
                  option?.value == o.value ? <Icon24Done fill="var(--vkui--color_icon_accent)" /> : null
                }
              >{o.label}</Cell>
            ) : <Footer>{config.texts.NotFound}</Footer>)}
        </div>
      </div>
    </div>
  </Panel>
}

export default GroupSelector;