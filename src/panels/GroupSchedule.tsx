import {Button, Calendar, LocaleProvider, Panel, Placeholder, PullToRefresh, Spinner,} from "@vkontakte/vkui";
import React, {FC, useEffect, useState} from "react";
import {CapitalizeFirstLetter, MergeLessons, SetupResizeObserver} from "../utils/utils";
import {Popover} from "@vkontakte/vkui/dist/components/Popover/Popover";
import config from "../etc/config.json"
import {MergedLesson, Option, Schedule as ScheduleType} from "../types.ts";
import {useActiveVkuiLocation, useRouteNavigator, useSearchParams} from "@vkontakte/vk-mini-apps-router";
import Loader from "../components/Loader.tsx";
import {GetGroups, GetGroupSchedule} from "../api/api.ts";
import Schedule from "../components/Schedule.tsx";
import {DEFAULT_VIEW_PANELS} from "../routes.ts";
import {Alert} from "@mui/material";
import Scrollable from "../components/Scrollable.tsx";
import SeptemberAlert from "../components/SeptemberAlert.tsx";
import CheckScheduleButton from "../components/CheckScheduleButton.tsx";
import ShareButton from "../components/ShareButton.tsx";

const GroupSchedule: FC<{
  id: string
  setPopout: (popout: React.ReactNode) => void
  option: Option | undefined
  setOption: (option: Option) => void
  subgroup: string
  popout: React.ReactNode
  panelHeader: React.ReactNode
}> = ({id, setPopout, popout, option, setOption, subgroup, panelHeader}) => {
  useEffect(() => SetupResizeObserver("group_schedule_resize"), []);

  const [maxDate, ] = useState(new Date((new Date()).setMonth((new Date()).getMonth() + 1)))
  const [minDate, ] = useState(new Date((new Date()).setFullYear((new Date()).getFullYear() - 10)))

  const routeNavigator = useRouteNavigator();
  const [params,] = useSearchParams();
  const [dayNum, setDayNum] = useState<number | undefined>()
  const [week, setWeek] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [link, setLink] = useState<string | undefined>()
  const [subgroupValue, setSubgroupValue] = useState<string>(subgroup)
  const {panel} = useActiveVkuiLocation();
  useEffect(() => {
    if (panel !== id) return;

    if (!params.get('day') || !params.get('month') || !params.get('year')) {
      routeNavigator.replace(`/${id}?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}`)
      return
    }

    let day = params.get('day')!
    let month = params.get('month')!
    const year = params.get('year')!
    const value = params.get('value') ?? ""
    const subgroup = params.get('subgroup')
    if (subgroup != undefined && (["1 и 2", "1", "2"] as string[]).includes(subgroup)) {
      setSubgroupValue(subgroup)
    }

    if (option == undefined || option.label == "" || option.value == "") {
      if (value != "") {
        setPopout(<Loader/>)
        GetGroups()
          .then(groups => {
            const o = groups.find(group => group.value === value)
            if (o == undefined) {
              setErrorMessage(config.errors.GroupNotFound)
              return
            }
            setOption(o)
          })
          .catch(console.error)
          .finally(() => setPopout(null))
      }
    }

    if (day.length === 1) {
      day = `0${day}`
    }

    if (month.length === 1) {
      month = `0${month}`
    }

    setLink(`${config.app.href}#/${id}?day=${day}&month=${month}&year=${year}&value=${value}`)
    const date = new Date(Date.parse(`${year}-${month}-${day}`))

    if (option == undefined || option.label == "" || option.value == "" || date > maxDate || date <= minDate) {
      routeNavigator.replace(`?day=${(new Date()).getDate()}&month=${(new Date()).getMonth() + 1}&year=${(new Date()).getFullYear()}&value=${value}`)
      return
    }

    setSelectedDate(date)
    let dayNum = date.getDay() - 1
    if (dayNum === -1) dayNum = 6
    setDayNum(dayNum)
    setWeek(date.getWeek())
  }, [params])

  const change = (date: Date | undefined) => {
    if (date == undefined || option == undefined) return
    routeNavigator.replace(`/${id}?day=${date.getDate()}&month=${date.getMonth() + 1}&year=${date.getFullYear()}&value=${option.value}`)
    setCalendar(false)
  }

  const [title, setTitle] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [schedule, setSchedule] = useState<ScheduleType[] | undefined>()
  const onRefresh = () => {
    if (popout != null || option == undefined || option.value == "") return
    setPopout(<Loader/>)
    setErrorMessage(undefined)
    setTitle(config.texts.GroupSchedule)
    GetGroupSchedule(selectedDate, option.value)
      .then(setSchedule)
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setPopout(null))
  }

  useEffect(() => onRefresh(), [week, option, option?.label]);

  const [mergedLessons, setMergedLessons] = useState<MergedLesson[] | undefined>()
  useEffect(() => {
    if (dayNum != undefined && schedule && schedule[dayNum] && schedule[dayNum].lesson != null)
      setMergedLessons(MergeLessons(schedule[dayNum].lesson));
  }, [dayNum, schedule]);

  const [calendar, setCalendar] = React.useState(false)
  return <Panel id={id}>
    {panelHeader}
    <PullToRefresh onRefresh={onRefresh} isFetching={popout != null}>
      {selectedDate != undefined && <div id="group_schedule_resize">
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
            onClick={() => routeNavigator.push(`/${DEFAULT_VIEW_PANELS.GroupSelector}`)}
            children={option?.label || config.texts.Group}
          />
        </div>

        <Scrollable disabled={!option || option.label == "" || option.value == ""} selectedDate={selectedDate}
                    setSelectedDate={change}/>

        {!option || option.value == "" || option.label == ""
          ? <Alert
            variant="outlined"
            severity="info"
            style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
            children={config.errors.GroupIsNull}
          />
          : popout == null
            ? <Schedule errorMessage={errorMessage} schedule={schedule} dayNum={dayNum} subgroup={subgroupValue}
                        mergedLessons={mergedLessons}/>
            : <Placeholder><Spinner size="small"/></Placeholder>}

        <SeptemberAlert selectedDate={selectedDate}/>

        <CheckScheduleButton dayNum={dayNum} schedule={schedule}/>

        <ShareButton title={title} link={link}/>
      </div>}
    </PullToRefresh>
  </Panel>
};

export default GroupSchedule;