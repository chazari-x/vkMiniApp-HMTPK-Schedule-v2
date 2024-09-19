import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner,} from "@vkontakte/vkui";
import React, {FC, useEffect, useState} from "react";
import {CapitalizeFirstLetter, FormatName, SetupResizeObserver} from "../utils/utils";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import config from "../etc/config.json"
import {Option} from "../types.ts";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import Loader from "../components/Loader.tsx";
import {GetTeachers, GetTeacherSchedule} from "../api/api.ts";
import Schedule from "../components/Schedule.tsx";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import Scrollable from "../components/Scrollable.tsx";
import SeptemberAlert from "../components/SeptemberAlert.tsx";
import CheckScheduleButton from "../components/CheckScheduleButton.tsx";
import ShareButton from "../components/ShareButton.tsx";
import NewAlert from "../components/Alert.tsx";

const TeacherSchedule: FC<{
  id: string
  setPopout: (popout: React.ReactNode) => void
  option: Option | undefined
  setOption: (option: Option) => void
  popout: React.ReactNode
  panelHeader: React.ReactNode
  minDate: Date
  maxDate: Date
}> = ({id, setPopout, popout, option, setOption, panelHeader, minDate, maxDate}) => {
  useEffect(() => SetupResizeObserver("teacher_schedule_resize"), []);

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const {panel} = useActiveVkuiLocation();

  const [dayNum, setDayNum] = useState<number | undefined>()
  const [week, setWeek] = useState<number | undefined>()
  const [year, setYear] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [dateParams, setDateParams] = useState<string>("")
  const [calendar, setCalendar] = React.useState(false)

  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [fetching, setFetching] = useState(false)

  const [title,] = useState(config.texts.TeacherSchedule)
  const [link, setLink] = useState(`${config.app.href}#/${id}`)
  const [comment, setComment] = useState(`Узнайте актуальную информацию о занятиях в приложении «ХМТПК Расписание».`)

  useEffect(() => update(), [params, panel])
  useEffect(() => update(), []);
  useEffect(() => onRefresh(), [option?.value, option?.label, week, year]);
  useEffect(() => changeComment(), [option?.label, week, year]);

  const update = () => {
    if (panel !== id) return;

    const value = params.get('value') ?? option?.value ?? ""

    if (!params.get('day') || !params.get('month') || !params.get('year')) {
      routeNavigator.replace(`/${id}?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}&value=${value}`)
      return
    }

    let day = params.get('day')!
    let month = params.get('month')!
    const year = params.get('year')!

    if ((!option || !option.label || !option.value) && value) {
      setPopout(<Loader/>)
      GetTeachers()
        .then(teachers => {
          const o = teachers.find(teacher => teacher.value === value)
          if (o == undefined) setErrorMessage(config.errors.TeacherNotFound)
          else setOption(o)
        })
        .catch(console.error)
        .finally(() => setPopout(null))
    }

    if (day.length === 1) day = `0${day}`
    if (month.length === 1) month = `0${month}`
    const date = new Date(Date.parse(`${year}-${month}-${day}`))

    if (date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}&value=${encodeURIComponent(value)}`)
      return
    }

    setSelectedDate(date)
    let dayNum = date.getDay() - 1
    if (dayNum === -1) dayNum = 6
    setDayNum(dayNum)
    setDateParams(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`)
    setFetching(false)
    setWeek(date.getWeek())
    setYear(date.getFullYear())
    changeComment(date)
  }

  const change = (date: Date | undefined) => {
    if (date == undefined || option == undefined) return
    setCalendar(false)
    routeNavigator.replace(`/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(option.value)}`)
  }

  const onRefresh = () => {
    if (fetching || !option || !option.value || !selectedDate) return
    setErrorMessage(undefined);
    setFetching(true);
    GetTeacherSchedule(selectedDate, option.value)
      .then((schedule) => window.schedule[`${option.value}-${selectedDate.getFullYear()}-${selectedDate.getWeek()}`] = schedule)
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setFetching(false))
  };

  const changeComment = (date: Date = selectedDate ?? new Date()) => {
    if (option != undefined && option.value != "") {
      setLink(`${config.app.href}#/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(option.value)}`)
      setComment(`Расписание преподавателя ${option.label} на ${date.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'})}. Ознакомьтесь с деталями в приложении «ХМТПК Расписание».`)
    } else {
      setLink(`${config.app.href}#/${id}`)
      setComment(`Узнайте актуальную информацию о занятиях в приложении «ХМТПК Расписание».`)
    }
  }

  return <Panel id={id}>
    {panelHeader}
    <PullToRefresh onRefresh={onRefresh} isFetching={popout != null || fetching}>
      <div id="teacher_schedule_resize">
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
              onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.TeacherSelector}${dateParams}`)}
              children={FormatName(option?.label)}
            />
          </div>

          <Scrollable disabled={!option || option.label == "" || option.value == ""} selectedDate={selectedDate}
                      setSelectedDate={change}/>

          <div className="hmtpk-lessons">
            {!option || option.value == "" || option.label == ""
              ? <NewAlert severity="info" children={config.errors.TeacherIsNull}/>
              : !errorMessage
                ? !fetching
                  ? <Schedule
                    schedule={window.schedule[`${option.value}-${year}-${week}`]?.schedule}
                    dayNum={dayNum}/>
                  : <Placeholder><Spinner size="small"/></Placeholder>
                : <NewAlert severity="error" children={errorMessage}/>}
          </div>

          <SeptemberAlert selectedDate={selectedDate}
                          schedule={option ? window.schedule[`${option.value}-${year}-${week}`]?.schedule : undefined}
                          dayNum={dayNum}/>

          <CheckScheduleButton dayNum={dayNum}
                               schedule={option ? window.schedule[`${option.value}-${year}-${week}`]?.schedule : undefined}/>

          <ShareButton title={title} link={link} comment={comment}/>
        </div>}
      </div>
    </PullToRefresh>
  </Panel>
};

export default TeacherSchedule;