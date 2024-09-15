import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner} from "@vkontakte/vkui";
import {FC, ReactNode, useEffect, useState} from "react";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import {GetGroupSchedule, GetTeacherSchedule} from "../api/api";
import {CapitalizeFirstLetter, MergeLessons, SetupResizeObserver} from "../utils/utils.tsx";
import {MergedLesson, NewSchedule, UserSettings} from "../types.ts";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import {Icon24Settings} from "@vkontakte/icons";
import Schedule from "../components/Schedule.tsx";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import Scrollable from "../components/Scrollable.tsx";
import SeptemberAlert from "../components/SeptemberAlert.tsx";
import CheckScheduleButton from "../components/CheckScheduleButton.tsx";
import ShareButton from "../components/ShareButton.tsx";
import config from "../etc/config.json";

const MySchedule: FC<{
  id: string
  setPopout: (popout: ReactNode) => void
  popout: ReactNode
  panelHeader: ReactNode
  userSettings: UserSettings
}> = ({id, popout, panelHeader, userSettings}) => {
  useEffect(() => SetupResizeObserver("my_schedule_resize"), []);

  const [maxDate,] = useState(new Date((new Date()).setMonth((new Date()).getMonth() + 1)))
  const [minDate,] = useState(new Date((new Date()).setFullYear((new Date()).getFullYear() - 10)))

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const [dayNum, setDayNum] = useState<number | undefined>()
  const [week, setWeek] = useState<number | undefined>()
  const [year, setYear] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [link, setLink] = useState<string | undefined>()
  const {panel} = useActiveVkuiLocation();
  useEffect(() => {
    update()
  }, [params, panel])

  useEffect(() => {
    update()
  }, []);

  const update = () => {
    if (panel !== id) return;

    if (!params.get('day') || !params.get('month') || !params.get('year')) {
      routeNavigator.replace(`?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}`)
      return
    }

    let day = params.get('day')!
    let month = params.get('month')!
    const year = params.get('year')!

    if (day.length === 1) day = `0${day}`
    if (month.length === 1) month = `0${month}`

    const date = new Date(Date.parse(`${year}-${month}-${day}`))

    if (date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}`)
      return
    }

    if (userSettings.group != "") {
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.GroupSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${userSettings.group}`)
      setTitle(config.texts.GroupSchedule)
    } else if (userSettings.teacher != "") {
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.TeacherSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(userSettings.teacher)}`)
      setTitle(config.texts.TeacherSchedule)
    }

    setSelectedDate(date)
    let dayNum = date.getDay() - 1
    if (dayNum === -1) dayNum = 6
    setDayNum(dayNum)
    setWeek(date.getWeek())
    setYear(date.getFullYear())
    setFetching(false)
  }

  const change = (date: Date | undefined) => {
    if (date == undefined) return
    if (userSettings.group != "") {
      setTitle(config.texts.GroupSchedule)
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.GroupSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${userSettings.group}`)
    } else if (userSettings.teacher != "") {
      setTitle(config.texts.TeacherSchedule)
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.TeacherSchedule}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${encodeURIComponent(userSettings.teacher)}`)
    }
    routeNavigator.replace(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`)
    setCalendar(false)
  }

  const [title, setTitle] = useState<string | undefined>(userSettings.group != "" ? config.texts.GroupSchedule : userSettings.teacher != "" ? config.texts.GroupSchedule : undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [schedule, setSchedule] = useState<NewSchedule | undefined>()
  const [fetching, setFetching] = useState(false)
  const onRefresh = () => {
    if (fetching || userSettings.group == "" && userSettings.teacher == "" || week == undefined) return
    setErrorMessage(undefined)
    if (userSettings.group != "") {
      setSchedule(undefined)
      setTitle(config.texts.GroupSchedule)
      setComment(`Посмотри расписание группы ${userSettings.groupLabel} на ${selectedDate.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'}
      )} в приложении "ХМТПК Расписание"`)
      setFetching(true)
      GetGroupSchedule(new Date(selectedDate), userSettings.group)
        .then(setSchedule)
        .catch((err: Error) => {
          setErrorMessage(err.message)
          setFetching(false)
        })
    } else if (userSettings.teacher != "") {
      setSchedule(undefined)
      setTitle(config.texts.TeacherSchedule)
      setComment(`Посмотри расписание преподавателя ${userSettings.teacher} на ${selectedDate.toLocaleDateString('ru',
        {day: '2-digit', month: 'long', year: 'numeric'}
      )} в приложении "ХМТПК Расписание"`)
      setFetching(true)
      GetTeacherSchedule(new Date(selectedDate), userSettings.teacher)
        .then(setSchedule)
        .catch((err: Error) => {
          setErrorMessage(err.message)
          setFetching(false)
        })
    }
  }

  const [comment, setComment] = useState("Посмотри расписание преподавателя в приложении \"ХМТПК Расписание\"")

  useEffect(() => onRefresh(), [week, year]);

  const [mergedLessons, setMergedLessons] = useState<MergedLesson[] | undefined>()
  useEffect(() => {
    if (!(schedule && schedule.date.getWeek() == week && schedule.date.getFullYear() == year)) return
    setFetching(false);
    if (dayNum != undefined && schedule.schedule[dayNum])
      setMergedLessons(MergeLessons(schedule.schedule[dayNum].lesson ?? []));
  }, [dayNum, schedule]);

  const [calendar, setCalendar] = useState(false)
  return (
    <Panel id={id}>
      {panelHeader}
      <PullToRefresh onRefresh={onRefresh} isFetching={popout != null || fetching}>
        {selectedDate != undefined && <div id="my_schedule_resize">
          <div className="hmtpk-popover">
            <Popover
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

          {popout == null && !fetching
            ? <Schedule schedule={schedule?.schedule} errorMessage={errorMessage} mergedLessons={mergedLessons}
                        dayNum={dayNum} subgroup={userSettings.subgroup}/>
            : <Placeholder><Spinner size="small"/></Placeholder>}

          <SeptemberAlert selectedDate={selectedDate} schedule={schedule?.schedule} dayNum={dayNum}
                          mergedLessons={mergedLessons}/>

          <CheckScheduleButton dayNum={dayNum} schedule={schedule?.schedule}/>

          <ShareButton title={title} link={link} comment={comment}/>
        </div>}
      </PullToRefresh>
    </Panel>
  )
};

export default MySchedule;