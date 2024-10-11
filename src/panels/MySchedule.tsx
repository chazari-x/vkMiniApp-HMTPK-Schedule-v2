import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner} from "@vkontakte/vkui";
import {FC, HtmlHTMLAttributes, ReactNode, useEffect, useState} from "react";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import {GetGroupSchedule, GetTeacherSchedule} from "../api/api";
import {CapitalizeFirstLetter, getUTC3Date, SetupResizeObserver} from "../utils/utils.tsx";
import {UserSettings} from "../types.ts";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import {Icon24Settings} from "@vkontakte/icons";
import Schedule from "../components/Schedule.tsx";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import Scrollable from "../components/Scrollable.tsx";
import SeptemberAlert from "../components/SeptemberAlert.tsx";
import CheckScheduleButton from "../components/CheckScheduleButton.tsx";
import ShareButton from "../components/ShareButton.tsx";
import config from "../etc/config.json";
import NewAlert from "../components/Alert.tsx";

export interface Props {
  id: string;
  setPopout: (popout: ReactNode) => void;
  popout: ReactNode;
  panelHeader: ReactNode;
  userSettings: UserSettings;
  minDate: Date;
  maxDate: Date;
}

const MySchedule: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, popout, panelHeader, userSettings, minDate, maxDate} = props;

  useEffect(() => SetupResizeObserver("my_schedule_resize"), []);

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const {panel} = useActiveVkuiLocation();

  const [dayNum, setDayNum] = useState<number | undefined>();
  const [week, setWeek] = useState<number | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calendar, setCalendar] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [fetching, setFetching] = useState(false);

  const [title, setTitle] = useState<string | undefined>(userSettings.group != "" ? config.texts.GroupSchedule : userSettings.teacher != "" ? config.texts.GroupSchedule : undefined);
  const [link, setLink] = useState<string | undefined>();
  const [comment, setComment] = useState("Узнайте актуальную информацию о занятиях в приложении «ХМТПК Расписание».");

  useEffect(() => update(), []);
  useEffect(() => update(), [params, panel]);
  useEffect(() => onRefresh(), [week, year]);
  useEffect(() => changeComment(), [userSettings.groupLabel, userSettings.teacher, week, year]);

  const update = () => {
    if (panel !== id) return;

    if (!params.get('day') || !params.get('month') || !params.get('year')) {
      routeNavigator.replace(`?day=${(getUTC3Date()).getDate()}&month=${(getUTC3Date()).getMonth() + 1}&year=${(getUTC3Date()).getFullYear()}`);
      return;
    }

    let day = params.get('day')!;
    let month = params.get('month')!;
    const year = params.get('year')!;

    if (day.length === 1) day = `0${day}`;
    if (month.length === 1) month = `0${month}`;

    const date = getUTC3Date(Date.parse(`${year}-${month}-${day}`));

    if (date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(getUTC3Date()).getDate()}&month=${(getUTC3Date()).getMonth() + 1}&year=${(getUTC3Date()).getFullYear()}`);
      return;
    }

    setSelectedDate(date);
    let dayNum = date.getDay() - 1;
    if (dayNum === -1) dayNum = 6;
    setDayNum(dayNum);
    setWeek(date.getWeek());
    setYear(date.getFullYear());
    setFetching(false);
    changeComment(date);
  };

  const change = (date: Date | undefined) => {
    if (date == undefined) return;
    setCalendar(false);
    routeNavigator.replace(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
  };

  const onRefresh = () => {
    if (fetching || (!userSettings.group && !userSettings.teacher) || !selectedDate) return;
    setErrorMessage(undefined);
    setFetching(true);
    if (userSettings.group != "") GetGroupSchedule(selectedDate, userSettings.group)
      .then((schedule) => window.schedule[`${userSettings.group}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`] = schedule)
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setFetching(false));
    else if (userSettings.teacher != "") GetTeacherSchedule(selectedDate, userSettings.teacher)
      .then((schedule) => window.schedule[`${userSettings.teacher}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`] = schedule)
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setFetching(false));
  };

  const changeComment = (date: Date = selectedDate ?? getUTC3Date()) => {
    if (userSettings.teacher) {
      setTitle(config.texts.TeacherSchedule);
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.TeacherSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(userSettings.teacher)}`);
      setComment(`Расписание преподавателя ${userSettings.teacher} на ${date.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'}
      )}. Ознакомьтесь с деталями в приложении «ХМТПК Расписание».`);
    } else if (userSettings.groupLabel) {
      setTitle(config.texts.GroupSchedule);
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.GroupSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(userSettings.group)}&label=${userSettings.groupLabel}`);
      setComment(`Расписание группы ${userSettings.groupLabel} на ${date.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'}
      )}. Ознакомьтесь с деталями в приложении «ХМТПК Расписание».`);
    }
  };

  return <Panel id={id}>
    {panelHeader}
    <PullToRefresh onRefresh={onRefresh} isFetching={popout != null || fetching}>
      <div id="my_schedule_resize">
        {selectedDate != undefined && <div>
          <div className="hmtpk-popover">
            <Popover
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
                appearance='accent-invariable'
                mode="outline"
                className="hmtpk-button"
                children={`${CapitalizeFirstLetter(selectedDate.toLocaleDateString('ru',
                  {month: 'short', year: '2-digit'}
                ))}`}
              />}
            />

            <Button
              aria-label={config.buttons.settings}
              align="center"
              appearance='accent-invariable'
              mode="outline"
              style={{height: "min-content"}}
              onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.Settings}/`)}
              before={<Icon24Settings width={16} height={16} style={{
                padding: 'calc(var(--vkui--size_base_padding_horizontal--regular) / 2)',
              }}/>}
            />
          </div>

          <Scrollable selectedDate={selectedDate} setSelectedDate={change}/>

          <div className="hmtpk-lessons">
            {!errorMessage
              ? !fetching
                ? <Schedule
                  schedule={window.schedule[`${userSettings.teacher + userSettings.group}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule}
                  dayNum={dayNum} subgroup={userSettings.subgroup}/>
                : <Placeholder><Spinner size="small"/></Placeholder>
              : <NewAlert severity="error" children={errorMessage}/>}
          </div>

          <SeptemberAlert selectedDate={selectedDate}
                          schedule={window.schedule[`${userSettings.teacher + userSettings.group}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule}
                          dayNum={dayNum}/>

          <CheckScheduleButton dayNum={dayNum}
                               schedule={window.schedule[`${userSettings.teacher + userSettings.group}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`]?.schedule}/>

          <ShareButton title={title} link={link} comment={comment}/>
        </div>}
      </div>
    </PullToRefresh>
  </Panel>;
};

export default MySchedule;