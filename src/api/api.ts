import config from "../etc/config.json";
import {Buffer} from 'buffer/';
import bridge from "@vkontakte/vk-bridge";
import {Announces, NewSchedule, Option, Schedule, UserSettings} from "../types.ts";
import {format} from "@vkontakte/vkui/dist/lib/date";
import base64 from "../etc/base64.json";

// Получить токен
async function token() {
  const data = await bridge.send('VKWebAppCreateHash', {payload: Buffer.from((window.location.search).substring(1)).toString('hex')})
  if (data.sign) {
    return JSON.stringify(data)
  }

  return ""
}

// Отправить запрос на сервер
async function sendRequest(href: string) {
  const t = await token();
  console.debug("token created")

  if (!t) throw new Error(`${config.errors.TokenIsNull} ${config.errors.TryAgainLater}`);

  try {
    const response = await fetch(`${config.api.href}${href}`, {method: "POST", body: t});

    console.debug(response.statusText)
    if (!response.ok) {
      const responseJson = await response.json().catch(() => null); // Безопасный парсинг JSON
      if (responseJson?.error) throw new Error(`${responseJson.error}. ${config.errors.TryAgainLater}`);
      throw new Error(`${config.errors.APINotWorking} ${config.errors.TryAgainLater}`);
    }

    // Успешный ответ
    const responseJson = await response.json();
    console.log(responseJson);
    return responseJson;
  } catch (error) {
    if (error instanceof TypeError) {
      console.debug("error instanceof TypeError")
      console.error(error);
      throw new Error(`${config.errors.APINotWorking} ${config.errors.TryAgainLater}`);
    } else if (error instanceof Error) {
      console.debug("error instanceof Error")
      console.error(error);
      throw error;
    } else {
      console.error("Неизвестная ошибка:", error);
      throw new Error(config.errors.TryAgainLater);
    }
  }
}

// Получить объявления
export async function GetAnnounces(page: number) {
  const href = '/announces?page=' + page.toString()

  const announces = window.localStorage.getItem(href)
  if (announces) {
    const parsed = JSON.parse(announces) as Announces
    if (parsed.timestamp != undefined && parsed.timestamp + 1000 * 60 * 10 > Date.now() && parsed.announces
      && parsed.announces.length > 0 && !!parsed.announces[0].body && !!parsed.announces[0].title
      && !!parsed.announces[0].date && !!parsed.announces[0].path && !!parsed.last_page) {
      return parsed
    }
  }

  const data = await sendRequest(href) as Announces

  data.timestamp = Date.now()
  window.localStorage.setItem(href, JSON.stringify(data))

  return data
}

// Получить расписание группы
export async function GetGroupSchedule(date: Date, group: string) {
  const week = date.getWeek()
  const year = date.getFullYear()
  const fDate = format(date, 'dd.MM.yyyy')
  {
    const data = window.localStorage.getItem(`group-schedule-${group}-${week}-${year}`);
    if (data) {
      const parsed = JSON.parse(data) as NewSchedule;

      // Если расписание не устарело
      if (parsed.schedule && parsed.schedule.length > 0
        && parsed.timestamp != undefined && parsed.timestamp + 1000 * 60 > Date.now()) {
        return parsed;
      }
    }
  }

  const href = `/schedule?key=VK&group=${group}&date=${fDate}`;
  const schedule = await sendRequest(href) as Schedule[];

  const timestamp = Date.now();
  window.localStorage.setItem(`group-schedule-${group}-${week}-${year}`, JSON.stringify({timestamp, schedule}));

  return {timestamp, schedule};
}

// Получить расписание преподавателя
export async function GetTeacherSchedule(date: Date, teacher: string) {
  const week = date.getWeek()
  const year = date.getFullYear()
  const fDate = format(date, 'dd.MM.yyyy')
  {
    const data = window.localStorage.getItem(`teacher-schedule-${teacher}-${week}-${year}`);
    if (data) {
      const parsed = JSON.parse(data) as NewSchedule;

      // Если расписание не устарело
      if (parsed.schedule && parsed.schedule.length > 0
        && parsed.timestamp != undefined && parsed.timestamp + 1000 * 60 > Date.now()) {
        return parsed;
      }
    }
  }

  const href = `/schedule?key=VK&teacher=${teacher}&date=${fDate}`;
  const schedule = await sendRequest(href) as Schedule[];

  const timestamp = Date.now();
  window.localStorage.setItem(`teacher-schedule-${teacher}-${week}-${year}`, JSON.stringify({timestamp, schedule}));

  return {timestamp, schedule};
}

function isOptionArray(data: unknown): data is Option[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.label === "string" &&
        typeof item.value === "string"
    )
  );
}

// Получить группы
export async function GetGroups(): Promise<Option[]> {
  const groups = window.localStorage.getItem('groups');

  if (groups) {
    try {
      const parsedGroups = JSON.parse(groups);
      if (isOptionArray(parsedGroups)) {
        return parsedGroups; // Возвращаем данные, если они корректны
      } else {
        console.warn("Некорректные данные в localStorage. Удаляем...");
        window.localStorage.removeItem('groups'); // Очищаем, если данные некорректны
      }
    } catch (error) {
      console.error("Ошибка при разборе JSON из localStorage:", error);
      window.localStorage.removeItem('groups'); // Удаляем некорректные данные
    }
  }

  // Если данных нет или они некорректны, загружаем их через API
  const href = '/groups';
  const data = (await sendRequest(href)) as unknown;

  if (isOptionArray(data)) {
    window.localStorage.setItem('groups', JSON.stringify(data)); // Сохраняем данные
    return data;
  } else {
    throw new Error("Полученные данные от API не соответствуют типу Option[]");
  }
}

// Получить преподавателей
export async function GetTeachers(): Promise<Option[]> {
  const teachers = window.localStorage.getItem('teachers');

  if (teachers) {
    try {
      const parsedTeachers = JSON.parse(teachers);
      if (isOptionArray(parsedTeachers)) {
        return parsedTeachers; // Возвращаем данные, если они корректны
      } else {
        console.warn("Некорректные данные в localStorage. Удаляем...");
        window.localStorage.removeItem('teachers'); // Очищаем, если данные некорректны
      }
    } catch (error) {
      console.error("Ошибка при разборе JSON из localStorage:", error);
      window.localStorage.removeItem('teachers'); // Удаляем некорректные данные
    }
  }

  // Если данных нет или они некорректны, загружаем их через API
  const href = '/teachers';
  const data = (await sendRequest(href)) as unknown;

  if (isOptionArray(data)) {
    window.localStorage.setItem('teachers', JSON.stringify(data)); // Сохраняем данные
    return data;
  } else {
    throw new Error("Полученные данные от API не соответствуют типу Option[]");
  }
}

// Удалить информацию о показе slides sheet
export async function DeleteSlidesSheet() {
  const response = await bridge.send('VKWebAppStorageSet', {key: 'slidesSheet', value: ''})
  return response.result
}

// Сохранить информацию о показе slides sheet
export async function SaveSlidesSheet(slidesSheet: boolean) {
  const response = await bridge.send('VKWebAppStorageSet', {key: 'slidesSheet', value: JSON.stringify(slidesSheet)})
  return response.result
}

// Получить информацию о показе slides sheet
export async function GetSlidesSheet() {
  const response = await bridge.send('VKWebAppStorageGet', {keys: ['slidesSheet']})
  return JSON.parse(response.keys[0].value) as boolean
}

// Отправить пользователю slides sheet
export function SendSlidesSheet() {
  return bridge.send('VKWebAppShowSlidesSheet', {
    slides: [
      {
        media: {blob: base64.one, type: 'image'},
        title: config.onboardings.one.title,
        subtitle: config.onboardings.one.subtitle
      },
      {
        media: {blob: base64.two, type: 'image'},
        title: config.onboardings.two.title,
        subtitle: config.onboardings.two.subtitle
      },
      {
        media: {blob: base64.three, type: 'image'},
        title: config.onboardings.three.title,
        subtitle: config.onboardings.three.subtitle
      },
      {
        media: {blob: base64.four, type: 'image'},
        title: config.onboardings.four.title,
        subtitle: config.onboardings.four.subtitle
      },
      {
        media: {blob: base64.five, type: 'image'},
        title: config.onboardings.five.title,
        subtitle: config.onboardings.five.subtitle
      },
      {
        media: {blob: base64.six, type: 'image'},
        title: config.onboardings.six.title,
        subtitle: config.onboardings.six.subtitle
      },
      {
        media: {blob: base64.seven, type: 'image'},
        title: config.onboardings.seven.title,
        subtitle: config.onboardings.seven.subtitle
      }
    ]
  })

}

// Сохранить пользовательские настройки
export async function SaveUserSettings(userSettings: UserSettings) {
  const response = await bridge.send('VKWebAppStorageSet', {key: 'schedule', value: JSON.stringify(userSettings)})
  return response.result
}

// Получить пользовательские настройки
export async function GetUserSettings() {
  const response = await bridge.send('VKWebAppStorageGet', {keys: ['schedule']})
  const userSettings = JSON.parse(response.keys[0].value) as UserSettings

  if (!!userSettings.group && !userSettings.groupLabel) {
    userSettings.group = ""
    userSettings.teacher = ""
  }

  return userSettings
}

// Удалить пользовательские настройки
export async function DeleteUserSettings() {
  const response = await bridge.send('VKWebAppStorageSet', {key: 'schedule', value: ''})
  return response.result
}

export async function CloseApp() {
  return await bridge.send('VKWebAppClose', {status: 'success'})
}

export function AppRecommend() {
  setTimeout(() => bridge.send('VKWebAppRecommend'), 5000)
}

export function AppJoinGroup() {
  setTimeout(() => bridge.send('VKWebAppJoinGroup', {group_id: config.group.id}), 5000)
}

export async function AppAddToHomeScreenInfo() {
  const response = await bridge.send('VKWebAppAddToHomeScreenInfo')
  return !response.is_added_to_home_screen && response.is_feature_supported
}

export function AppAddToHomeScreen() {
  setTimeout(() => {
    bridge.send('VKWebAppAddToHomeScreen')
  }, 5000)
}