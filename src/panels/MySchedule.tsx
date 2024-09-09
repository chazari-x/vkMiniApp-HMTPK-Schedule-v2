import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner} from "@vkontakte/vkui";
import {FC, ReactNode, useEffect, useState} from "react";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import {GetGroupSchedule, GetTeacherSchedule} from "../api/api";
import {CapitalizeFirstLetter, MergeLessons, SetupResizeObserver} from "../utils/utils.tsx";
import {MergedLesson, Schedule as ScheduleType, UserSettings} from "../types.ts";
import Loader from "../components/Loader.tsx";
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
}> = ({id, setPopout, popout, panelHeader, userSettings}) => {
  useEffect(() => SetupResizeObserver("my_schedule_resize"), []);

  const [maxDate, ] = useState(new Date((new Date()).setMonth((new Date()).getMonth() + 1)))
  const [minDate, ] = useState(new Date((new Date()).setFullYear((new Date()).getFullYear() - 10)))

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const [dayNum, setDayNum] = useState<number | undefined>()
  const [week, setWeek] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [link, setLink] = useState<string | undefined>()
  const {panel} = useActiveVkuiLocation();
  useEffect(() => {
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

    setSelectedDate(date)
    let dayNum = date.getDay() - 1
    if (dayNum === -1) dayNum = 6
    setDayNum(dayNum)
    setWeek(date.getWeek())
  }, [params])

  const change = (date: Date | undefined) => {
    if (date == undefined) return
    routeNavigator.replace(`?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}`)
    setCalendar(false)
  }

  const [title, setTitle] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [schedule, setSchedule] = useState<ScheduleType[] | undefined>()
  const onRefresh = () => {
    if (popout != null || userSettings.group == "" && userSettings.teacher == "" || week == undefined) return
    setPopout(<Loader/>)
    setErrorMessage(undefined)
    if (userSettings.group != "") {
      setTitle(config.texts.GroupSchedule)
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.GroupSchedule}?day=${selectedDate.getDay()}&month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}&value=${userSettings.group}`)
      GetGroupSchedule(selectedDate, userSettings.group)
        .then(setSchedule)
        .catch((err: Error) => setErrorMessage(err.message))
        .finally(() => setPopout(null))
    } else if (userSettings.teacher != "") {
      setTitle(config.texts.TeacherSchedule)
      setLink(`${config.app.href}#/${DEFAULT_VIEW_PANELS.TeacherSchedule}?day=${selectedDate.getDay()}&month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}&value=${userSettings.teacher}`)
      GetTeacherSchedule(selectedDate, userSettings.teacher)
        .then(setSchedule)
        .catch((err: Error) => setErrorMessage(err.message))
        .finally(() => setPopout(null))
    }
  }

  useEffect(() => onRefresh(), [week]);

  const [mergedLessons, setMergedLessons] = useState<MergedLesson[] | undefined>()
  useEffect(() => {
    if (dayNum != undefined && schedule && schedule[dayNum] && schedule[dayNum].lesson != null)
      setMergedLessons(MergeLessons(schedule[dayNum].lesson));
  }, [dayNum, schedule]);

  const [calendar, setCalendar] = useState(false)
  return (
    <Panel id={id}>
      {panelHeader}
      <PullToRefresh onRefresh={onRefresh} isFetching={popout != null}>
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

          {popout == null
            ? <Schedule schedule={schedule} errorMessage={errorMessage} mergedLessons={mergedLessons}
                        dayNum={dayNum} subgroup={userSettings.subgroup}/>
            : <Placeholder><Spinner size="small"/></Placeholder>}

          <SeptemberAlert selectedDate={selectedDate}/>

          <CheckScheduleButton dayNum={dayNum} schedule={schedule}/>

          <ShareButton title={title} link={link}/>
        </div>}
      </PullToRefresh>
    </Panel>
  )
};

export default MySchedule;