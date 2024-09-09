import {CardGrid, Placeholder} from "@vkontakte/vkui";
import React, {FC} from "react";
import {Icon28User, Icon28Users} from "@vkontakte/icons";
import {Alert} from "@mui/material";
import {MergedLesson, Schedule as ScheduleType} from "../types.ts";
import config from "../etc/config.json";

const Schedule: FC<{
  errorMessage: string | undefined
  schedule: ScheduleType[] | undefined
  dayNum: number | undefined
  subgroup?: string | undefined
  mergedLessons: MergedLesson[] | undefined
}> = ({errorMessage, mergedLessons, subgroup, schedule, dayNum}) => <div>
  {errorMessage == undefined && schedule != undefined && dayNum != undefined
    ? mergedLessons != undefined && mergedLessons.length > 0 && schedule[dayNum].lesson != null
      ? mergedLessons.map((mergedLesson, index) => {
        let c = 'var(--vkui--color_text_secondary)'
        let color = 'var(--vkui--color_text_tertiary)'

        if (mergedLesson.subgroups.some(s => s.subgroup === subgroup || s.subgroup == "" || subgroup == "1 и 2" || !subgroup)
          || mergedLesson.subgroups.length == 0) {
          c = 'var(--vkui--color_text_primary)'
          color = 'var(--vkui--color_text_secondary)'
        }

        return <CardGrid
          key={`lesson-${mergedLesson.num}-num-${index}`}
          size='m'
          className="hmtpk-lesson"
          style={{color: c}}
        >
          <div className="hmtpk-lesson-time" style={{color: c}}>
            {mergedLesson.time.replace('- ', '')}
          </div>
          <div className="hmtpk-lesson-block">
            <div className="hmtpk-lesson-name">{mergedLesson.name}</div>

            {mergedLesson.subgroups.map((subgroup, subIndex) => (
              <React.Fragment key={`subgroup-${index}-${subIndex}`}>
                {subgroup.teacher !== '' && <div className="hmtpk-lesson-teacher">
                  <Icon28User width={16} height={16} fill={color}/>{`${subgroup.teacher}`}
                </div>}

                {subgroup.group !== '' && <div className="hmtpk-lesson-group">
                  <div style={{marginRight: '4px'}}>
                    <Icon28Users width={16} height={16} fill={color}/>
                  </div>
                  <div>{subgroup.group}</div>
                  <div style={{color: color}}>
                    {subgroup.subgroup !== '' && ` / подгр. ${subgroup.subgroup}`}
                  </div>
                </div>}

                {subgroup.group === '' && subgroup.subgroup !== "" &&
                  <div className="hmtpk-lesson-group" style={{color: color}}>
                    {`подгр. ${subgroup.subgroup}`}
                  </div>
                }

                {(subgroup.room !== "" || subgroup.location !== "") &&
                  <div className="hmtpk-lesson-room" style={{color: color}}>
                    {`ауд. ${subgroup.room}`}{subgroup.location !== "" && ` / ${subgroup.location}`}
                  </div>
                }
              </React.Fragment>
            ))}
          </div>
        </CardGrid>
      })
      : <Placeholder children={config.texts.NoLessons}/>
    : errorMessage != undefined ? <Alert
    variant="outlined"
    severity="error"
    style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
    children={errorMessage}
  /> : <Placeholder children={config.texts.NoLessons}/>}
</div>

export default Schedule;