import React, {FC, HtmlHTMLAttributes, useEffect, useState} from "react";
import {Button, Cell, Panel, Placeholder, Search} from "@vkontakte/vkui";
import {Icon16CancelCircleOutline, Icon24Done} from "@vkontakte/icons";
import config from "../etc/config.json";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import {Option} from "../types.ts";
import Loader from "../components/Loader.tsx";
import {GetTeachers} from "../api/api.ts";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import {getUTC3Date, SetupResizeObserver} from "../utils/utils.tsx";

export interface Props {
  id: string;
  option: Option | undefined;
  setOption: (option: Option) => void;
  panelHeader: React.ReactNode;
  setPopout: (popout: React.ReactNode) => void;
}

const TeacherSelector: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, option, setOption, panelHeader, setPopout} = props;

  useEffect(() => SetupResizeObserver("teacher_selector_resize"), []);
  const routeNavigator = useRouteNavigator();

  const {panel} = useActiveVkuiLocation();
  const [params,] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(getUTC3Date());
  useEffect(() => {
    if (panel !== id) return;

    if (!params.get('day') || !params.get('month') || !params.get('year')) return;

    let day = params.get('day')!;
    let month = params.get('month')!;
    const year = params.get('year')!;

    if (day.length === 1) day = `0${day}`;
    if (month.length === 1) month = `0${month}`;

    const date = getUTC3Date(Date.parse(`${year}-${month}-${day}`));
    setSelectedDate(date);
  }, []);

  const [options, setOptions] = useState<Option[] | undefined>();
  useEffect(() => updateOptions(), []);
  const updateOptions = () => {
    setPopout(<Loader/>);
    GetTeachers()
      .then(setOptions)
      .catch(console.error)
      .finally(() => setPopout(null));
  };

  const [search, setSearch] = React.useState('');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/^\s+/, '')  // Удаляет пробелы в начале строки
      .replace(/\s{2,}/g, ' ');  // Заменяет несколько пробелов на один
    setSearch(value);
  };

  const thematicsFiltered = options?.filter(({label}) => label.toLowerCase().indexOf(search.toLowerCase()) > -1);

  return <Panel id={id}>
    {panelHeader}
    <div id="teacher_selector_resize">
      <div className="selector_buttons">
        <Button
          appearance='negative'
          align="center"
          mode="outline"
          onClick={() => routeNavigator.back()}
          before={<Icon16CancelCircleOutline/>}
          children={config.buttons.close}
        />
      </div>

      <div className="selector_body">
        <Search value={search} onChange={onChange} after={null} noPadding/>

        <div>
          {thematicsFiltered && (thematicsFiltered.length > 0
            ? thematicsFiltered.map((o) =>
              <Cell
                key={o.value}
                onClick={() => {
                  setOption(o)
                  routeNavigator.replace(`/${DEFAULT_VIEW_PANELS.TeacherSchedule}?day=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}&value=${encodeURIComponent(o.value)}`)
                }}
                after={option?.value == o.value ? <Icon24Done fill="var(--vkui--color_icon_accent)"/> : null}
                children={o.label}
              />
            ) : <Placeholder>{config.texts.NotFound}</Placeholder>)}
        </div>
      </div>
    </div>
  </Panel>;
};

export default TeacherSelector;