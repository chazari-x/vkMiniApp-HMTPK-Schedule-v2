import bridge from "@vkontakte/vk-bridge";
import {Lesson, MergedLesson} from "../types.ts";
import {toZonedTime} from 'date-fns-tz';

export const CapitalizeFirstLetter = (str: string) => {
  const chars = str.split('');
  chars[0] = chars[0].toUpperCase();
  return chars.join('');
}

export function FormatName(inputName: string | undefined) {
  if (!inputName) return "Преподаватель"

  const parts = inputName.split(" ");

  if (parts.length === 1) {
    return parts[0]
  } else if (parts.length === 2) {
    const [surname, name] = parts
    return `${surname} ${name[0]}.`
  } else if (parts.length === 3) {
    const [surname, name, patronymic] = parts
    return `${surname} ${name[0]}. ${patronymic[0]}.`
  } else {
    const [surname, name, patronymic] = parts.slice(0, 3)
    return `${surname} ${name[0]}. ${patronymic[0]}. ...`
  }
}

Date.prototype.getWeek = function (): number {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() - 1) / 7);
}

export function SetupResizeObserver(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const resizeObserver = new ResizeObserver(() => {
    const margin = parseInt(getComputedStyle(element).getPropertyValue("margin-top").replace("px", ''), 10);

    const panelHeader = document.getElementsByClassName("vkuiPanelHeader");
    if (!panelHeader || !panelHeader.item(0)) return;

    const headerHeight = panelHeader.item(0)!.clientHeight;

    const height = element.clientHeight + headerHeight + margin * 2

    bridge.supportsAsync("VKWebAppResizeWindow").then(res => {
      if (res) {
        bridge.send("VKWebAppResizeWindow", {
          height: height >= 600 ? height : 600,
          width: element.clientWidth
        });
      }
    });
  });

  // Подключаем observer к элементу
  resizeObserver.observe(element);

  // Если требуется отключить отслеживание в будущем
  return () => resizeObserver.unobserve(element);
}

export function MergeLessons(lessons: Lesson[]) {
  return lessons.reduce((acc: MergedLesson[], lesson) => {
    const existingLesson = acc.find(item => item.num === lesson.num && item.name === lesson.name);
    if (existingLesson) {
      existingLesson.subgroups.push({
        teacher: lesson.teacher,
        room: lesson.room,
        location: lesson.location,
        group: lesson.group,
        subgroup: lesson.subgroup,
      });
    } else {
      acc.push({
        num: lesson.num,
        name: lesson.name,
        time: lesson.time,
        subgroups: [{
          teacher: lesson.teacher,
          room: lesson.room,
          location: lesson.location,
          group: lesson.group,
          subgroup: lesson.subgroup,
        }],
      });
    }
    return acc;
  }, []);
}


export function getUTC3Date (date?: number | string | Date): Date {
  let currentDate: Date
  if (date) currentDate = new Date(date);
  else currentDate = new Date();

  return toZonedTime(currentDate, 'Etc/GMT-5');
}