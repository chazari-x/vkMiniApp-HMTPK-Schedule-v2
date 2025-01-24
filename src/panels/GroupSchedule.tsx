import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner,} from "@vkontakte/vkui";
import React, {FC, HtmlHTMLAttributes, useEffect, useState} from "react";
import {CapitalizeFirstLetter, getUTC3Date, SetupResizeObserver} from "../utils/utils";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import config from "../etc/config.json"
import {Option} from "../types.ts";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import {GetGroups, GetGroupSchedule} from "../api/api.ts";
import Schedule from "../components/Schedule.tsx";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import Scrollable from "../components/Scrollable.tsx";
import SeptemberAlert from "../components/SeptemberAlert.tsx";
import CheckScheduleButton from "../components/CheckScheduleButton.tsx";
import ShareButton from "../components/ShareButton.tsx";
import NewAlert from "../components/Alert.tsx";
import Loader from "../components/Loader.tsx";

export interface Props {
  id: string;
  setPopout: (popout: React.ReactNode) => void;
  option: Option | undefined;
  setOption: (option: Option) => void;
  subgroup: string;
  popout: React.ReactNode;
  panelHeader: React.ReactNode;
  minDate: Date;
  maxDate: Date;
}

const GroupSchedule: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, popout, setPopout, option, setOption, subgroup, panelHeader, minDate, maxDate} = props;

  useEffect(() => SetupResizeObserver("group_schedule_resize"), []);

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const {panel} = useActiveVkuiLocation();

  const [dayNum, setDayNum] = useState<number | undefined>();
  const [week, setWeek] = useState<number | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateParams, setDateParams] = useState("");
  const [calendar, setCalendar] = React.useState(false);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [fetching, setFetching] = useState(false);

  const [title,] = useState<string>(config.texts.GroupSchedule);
  const [link, setLink] = useState(`${config.app.href}#/${id}`);
  const [comment, setComment] = useState(`Узнайте актуальную информацию о занятиях в приложении «ХМТПК Расписание».`);

  useEffect(() => update(), []);
  useEffect(() => update(), [params, panel]);
  useEffect(() => onRefresh(), [option?.value, option?.label, week, year]);
  useEffect(() => changeComment(), [option?.label, week, year]);

  const update = () => {
    if (panel !== id) return;

    const value = params.get('value') ?? option?.value ?? "";
    const label = params.get('label') ?? option?.label ?? "";

    if (!params.get('day') || !params.get('month') || !params.get('year')) {
      routeNavigator.replace(`/${id}?day=${(getUTC3Date()).getDate()}&month=${(getUTC3Date()).getMonth() + 1}&year=${(getUTC3Date()).getFullYear()}&value=${value}&label=${label}`);
      return;
    }

    let day = params.get('day')!;
    let month = params.get('month')!;
    const year = params.get('year')!;

    if ((!option || !option.label || !option.value) && value) {
      if (label) setOption({label: label, value: value})
      else {
        setPopout(<Loader/>);
        GetGroups()
          .then(groups => {
            const o = groups.find(group => group.value === value);
            !o ? setErrorMessage(config.errors.GroupNotFound) : setOption(o);
          })
          .catch(console.error)
          .finally(() => setPopout(null));
      }
    }

    if (day.length === 1) day = `0${day}`;
    if (month.length === 1) month = `0${month}`;
    const date = getUTC3Date(Date.parse(`${year}-${month}-${day}`));

    if (date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(getUTC3Date()).getDate()}&month=${(getUTC3Date()).getMonth() + 1}&year=${(getUTC3Date()).getFullYear()}&value=${value}&label=${label}`);
      return;
    }

    setSelectedDate(date);
    let dayNum = date.getDay() - 1;
    if (dayNum === -1) dayNum = 6;
    setDayNum(dayNum);
    setDateParams(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
    setFetching(false);
    setWeek(date.getWeek());
    setYear(date.getFullYear());
    changeComment(date);
  };

  const change = (date: Date | undefined) => {
    if (date == undefined || option == undefined) return;
    setCalendar(false);
    routeNavigator.replace(`/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${option.value}&label=${option.label}`);
  };

  const onRefresh = () => {
    if (fetching || !option || !option.value || !selectedDate) return;
    setErrorMessage(undefined);
    setFetching(true);
    GetGroupSchedule(selectedDate, option.value)
      .then((schedule) => window.schedule[`${option.value}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`] = schedule)
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setFetching(false));
  };

  const changeComment = (date: Date = selectedDate ?? getUTC3Date()) => {
    if (option != undefined && option.value != "") {
      setLink(`${config.app.href}#/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${option.value}&label=${option.label}`);
      setComment(`Расписание группы ${option.label} на ${date.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'})}. Ознакомьтесь с деталями в приложении «ХМТПК Расписание».`);
    } else {
      setLink(`${config.app.href}#/${id}`);
      setComment(`Узнайте актуальную информацию о занятиях в приложении «ХМТПК Расписание».`);
    }
  };

  return <Panel id={id}>
    {panelHeader}
    <PullToRefresh onRefresh={onRefresh} isFetching={popout != null || fetching}>
      <div id="group_schedule_resize">
        {selectedDate != undefined && <div>
          <div className="hmtpk-popover">
            <Popover
              disabled={!option || option.label == "" || option.value == ""}
              trigger="click"
              shown={calendar}
              onShownChange={setCalendar}
              style={{display: 'flex', justifyContent: 'center', background: 'none'}}
              content={<LocaleProvider value='ru'>
                <Calendar
                  size='m'
                  value={selectedDate}
                  onChange={change}
                  disablePickers
                  showNeighboringMonth
                  maxDateTime={maxDate}
                  minDateTime={minDate}
                />
              </LocaleProvider>}
              children={<Button
                align="center"
                disabled={!option || option.label == "" || option.value == ""}
                appearance='accent-invariable'
                mode="outline"
                className="hmtpk-button"
                children={`${CapitalizeFirstLetter(selectedDate.toLocaleDateString('ru',
                  {month: 'short', year: '2-digit'}
                ))}`}
              />}
            />

            <Button
              appearance='accent-invariable'
              mode='outline'
              onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.GroupSelector}${dateParams}`)}
              children={option?.label || config.texts.Group}
            />
          </div>

          <Scrollable disabled={!option || option.label == "" || option.value == ""} selectedDate={selectedDate}
                      setSelectedDate={change}/>

          <div className="hmtpk-lessons">
            {!option || option.value == "" || option.label == ""
              ? <NewAlert severity="info" children={config.errors.GroupIsNull}/>
              : !errorMessage
                ? !fetching
                  ? <Schedule
                    schedule={window.schedule[`${option.value}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule}
                    dayNum={dayNum} subgroup={subgroup}/>
                  : <Placeholder><Spinner size="small"/></Placeholder>
                : <NewAlert severity="error" children={errorMessage}/>}
          </div>

          <SeptemberAlert selectedDate={selectedDate}
                          schedule={option ? window.schedule[`${option.value}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule : undefined}
                          dayNum={dayNum}/>

          <CheckScheduleButton dayNum={dayNum}
                               schedule={option ? window.schedule[`${option.value}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule : undefined}/>

          <ShareButton title={title} link={link} comment={comment}/>
        </div>}

        <div className="hmtpk-footer">
          Х М Т П К
        </div>
      </div>
    </PullToRefresh>
  </Panel>;
};

export default GroupSchedule;