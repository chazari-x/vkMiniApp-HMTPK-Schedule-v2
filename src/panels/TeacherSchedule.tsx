import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner,} from "@vkontakte/vkui";
import React, {FC, useEffect, useState} from "react";
import {CapitalizeFirstLetter, FormatName, MergeLessons, SetupResizeObserver} from "../utils/utils";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import config from "../etc/config.json"
import {MergedLesson, NewSchedule, Option} from "../types.ts";
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
}> = ({id, setPopout, popout, option, setOption, panelHeader}) => {
  useEffect(() => SetupResizeObserver("teacher_schedule_resize"), []);

  const [maxDate,] = useState(new Date((new Date()).setMonth((new Date()).getMonth() + 1)))
  const [minDate,] = useState(new Date((new Date()).setFullYear((new Date()).getFullYear() - 10)))

  const routeNavigator = useRouteNavigator();
  const [link, setLink] = useState<string | undefined>()
  const [dayNum, setDayNum] = useState<number | undefined>()
  const [week, setWeek] = useState<number | undefined>()
  const [year, setYear] = useState<number | undefined>()
  const [params,] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const {panel} = useActiveVkuiLocation();
  const [dateParams, setDateParams] = useState<string>("")
  useEffect(() => {
    update()
  }, [params, panel, option?.label, option?.value])

  useEffect(() => {
    update()
  }, []);

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

    if (option == undefined || option.label == "" || option.value == "") {
      if (value != "") {
        setPopout(<Loader/>)
        GetTeachers()
          .then(teachers => {
            const o = teachers.find(teacher => teacher.value === value)
            if (o == undefined) {
              setErrorMessage(config.errors.TeacherNotFound)
              return
            }
            setOption(o)
          })
          .catch(console.error)
          .finally(() => setPopout(null))
      }
    }

    if (day.length === 1) day = `0${day}`
    if (month.length === 1) month = `0${month}`
    const date = new Date(Date.parse(`${year}-${month}-${day}`))

    if (date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}&value=${encodeURIComponent(value)}`)
      return
    }

    if (value != "") setLink(`${config.app.href}#/${id}?day=${day}&month=${month}&year=${year}&value=${encodeURIComponent(value)}`)
    else setLink(undefined)

    setSelectedDate(date)
    let dayNum = date.getDay() - 1
    if (dayNum === -1) dayNum = 6
    setDayNum(dayNum)
    setWeek(date.getWeek())
    setYear(date.getFullYear())
    setDateParams(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`)
    setFetching(false)
    setComment(`Посмотри расписание преподавателя на ${selectedDate.toLocaleDateString('ru',
      {day: '2-digit', month: 'long', year: 'numeric'}
    )} в приложении "ХМТПК Расписание"`)
  }

  const change = (date: Date | undefined) => {
    if (date == undefined || option == undefined) return
    routeNavigator.replace(`/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(option.value)}`)
    setLink(`${config.app.href}#/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(option.value)}`)
    setCalendar(false)
  }

  const [title,] = useState<string>(config.texts.TeacherSchedule)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [schedule, setSchedule] = useState<NewSchedule | undefined>()
  const [fetching, setFetching] = useState(false)
  const onRefresh = () => {
    if (fetching || !option || !option.value || !week || !year) return

    setErrorMessage(undefined);
    setSchedule(undefined);
    setFetching(true);

    GetTeacherSchedule(new Date(selectedDate), option.value)
      .then(setSchedule)
      .catch((err: Error) => {
        setErrorMessage(err.message)
        setFetching(false)
      })
  };

  const [comment, setComment] = useState(`Посмотри расписание преподавателя в приложении "ХМТПК Расписание"`)
  const changeComment = (teacher: string) => {
    setComment(`Посмотри расписание преподавателя ${teacher} на ${selectedDate.toLocaleDateString('ru',
      {day: '2-digit', month: 'long', year: 'numeric'}
    )} в приложении "ХМТПК Расписание"`)
  }
  useEffect(() => {
    if (option != undefined && option.value != "") changeComment(option.label)
  }, [option?.label]);

  useEffect(() => onRefresh(), [week, option?.value, option?.label, year]);

  const [mergedLessons, setMergedLessons] = useState<MergedLesson[] | undefined>()
  useEffect(() => {
    if (!(schedule && schedule.date.getWeek() == week && schedule.date.getFullYear() == year)) return
    setFetching(false);
    if (dayNum != undefined && schedule.schedule[dayNum])
      setMergedLessons(MergeLessons(schedule.schedule[dayNum].lesson ?? []));
  }, [dayNum, schedule]);

  const [calendar, setCalendar] = React.useState(false)
  return <Panel id={id}>
    {panelHeader}
    <PullToRefresh onRefresh={onRefresh} isFetching={popout != null || fetching}>
      {selectedDate != undefined && <div id="teacher_schedule_resize">
        <div className="hmtpk-popover">
          <Popover
            disabled={!option || option.label == "" || option.value == ""}
            trigger="click"
            shown={calendar}
            onShownChange={setCalendar}
            style={{
              display: 'flex',
              justifyContent: 'center',
              background: 'none'
            }}
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

        {!option || option.value == "" || option.label == ""
          ? <NewAlert
            severity="info"
            children={config.errors.TeacherIsNull}
          />
          : popout == null && !fetching
            ? <Schedule errorMessage={errorMessage} schedule={schedule?.schedule} dayNum={dayNum}
                        mergedLessons={mergedLessons}/>
            : <Placeholder><Spinner size="small"/></Placeholder>}

        <SeptemberAlert selectedDate={selectedDate} schedule={schedule?.schedule} dayNum={dayNum} mergedLessons={mergedLessons}/>

        <CheckScheduleButton dayNum={dayNum} schedule={schedule?.schedule}/>

        <ShareButton title={title} link={link} comment={comment}/>
      </div>}
    </PullToRefresh>
  </Panel>
};

export default TeacherSchedule;