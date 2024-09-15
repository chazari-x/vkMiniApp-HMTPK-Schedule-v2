import {Placeholder, Separator, Spinner} from "@vkontakte/vkui";
import React, {FC, useEffect, useState} from "react";
import {Icon28User, Icon28Users} from "@vkontakte/icons";
import {MergedLesson, Schedule as ScheduleType} from "../types.ts";
import config from "../etc/config.json";
import {MergeLessons} from "../utils/utils.tsx";

const Schedule: FC<{
  schedule: ScheduleType[] | undefined
  dayNum: number | undefined
  subgroup?: string | undefined
}> = ({subgroup, schedule, dayNum}) => {
  const [mergedLessons, setMergedLessons] = useState<MergedLesson[] | undefined>()
  useEffect(() => {
    setMergedLessons(MergeLessons(schedule && dayNum != undefined && schedule[dayNum].lesson ? schedule[dayNum].lesson : []))
  }, [schedule, dayNum]);

  return <div className="hmtpk-lessons" key={`lessons-${dayNum}`}>
    {schedule != undefined && dayNum != undefined
      ? mergedLessons != undefined && mergedLessons.length > 0 && schedule[dayNum].lesson != null
        ? mergedLessons.map((mergedLesson, index) => {
          let c = 'var(--vkui--color_text_secondary)'
          let color = 'var(--vkui--color_text_tertiary)'

          if (mergedLesson.subgroups.some(s => s.subgroup === subgroup || s.subgroup == "" || subgroup == "1 и 2" || !subgroup)
            || mergedLesson.subgroups.length == 0) {
            c = 'var(--vkui--color_text_primary)'
            color = 'var(--vkui--color_text_secondary)'
          }

          return <>
            <div key={`lesson-${mergedLesson.num}-num-${index}`} className="hmtpk-lesson" style={{color: c}}>
              <div className="hmtpk-lesson-time" style={{color: c}} key={`time-${index}`}>
                {mergedLesson.time.replace('- ', '')}
              </div>
              <div className="hmtpk-lesson-block" key={`block-${index}`}>
                <div className="hmtpk-lesson-name" key={`name-${index}`}>{mergedLesson.name}</div>
                {mergedLesson.subgroups.map((subgroup, subIndex) => (
                  <React.Fragment key={`subgroup-${index}-${subIndex}`}>
                    {!!subgroup.teacher && <div className="hmtpk-lesson-teacher" key={`teacher-${index}-${subIndex}`}>
                      <Icon28User width={16} height={16} fill={color}/>
                      <span>{subgroup.teacher}</span>
                    </div>}
                    {!!subgroup.group && <div className="hmtpk-lesson-group" key={`group-${index}-${subIndex}`}>
                      <Icon28Users width={16} height={16} fill={color}/>
                      <span>{subgroup.group}</span>
                      {!!subgroup.subgroup && <span style={{color: color}}>/</span>}
                      {subgroup.subgroup !== '' && <span style={{color: color}}>подгр. {subgroup.subgroup}</span>}
                    </div>}
                    <div className="hmtpk-lesson-group-room-block" style={{color: color}}>
                      {subgroup.group === '' && subgroup.subgroup !== "" && <span>подгр. {subgroup.subgroup}</span>}
                      {subgroup.group === '' && subgroup.subgroup !== ""
                        && (subgroup.room !== "" || subgroup.location !== "") && <span>—</span>}
                      {(subgroup.room !== "" || subgroup.location !== "") && <span>ауд. {subgroup.room}</span>}
                      {!!subgroup.location && <span>/</span>}
                      {!!subgroup.location && <span>{subgroup.location}</span>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {index !== mergedLessons.length - 1 && <Separator key={`separator-${index}`}/>}
          </>
        })
        : schedule[dayNum].lesson && schedule[dayNum].lesson.length > 0
          ? <Placeholder><Spinner size="small"/></Placeholder>
          : <Placeholder children={config.texts.NoLessons} key="no-lessons"/>
      : <Placeholder children={config.texts.NoLessons} key="no-lessons"/>}
  </div>
}

export default Schedule;