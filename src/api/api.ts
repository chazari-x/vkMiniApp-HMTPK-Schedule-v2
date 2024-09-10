import config from "../etc/config.json";
import {Buffer} from 'buffer/';
import bridge from "@vkontakte/vk-bridge";
import {Option, Schedule, UserSettings} from "../types.ts";
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
  const t = await token()
  if (t === "") {
    throw new Error(config.errors.Token)
  }

  try {
    const response = await fetch(config.api.href + href, {
      method: "POST",
      body: t
    })

    if (!response.ok) {
      switch (response.status) {
        case 408:
          throw new Error(config.errors.RequestsTimeout)
        case 401:
          throw new Error(config.errors.Token)
        case 500:
          if ((await response.json()).message == "hmtpk not working") {
            throw new Error(config.errors.TimeoutExceeded)
          }
          throw new Error(config.errors.APINotWorking)
        default:
          throw new Error(config.errors.APINotWorking)
      }
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      console.log(error)
      return new Error(config.errors.APINotWorking)
    } else {
      throw error
    }
  }
}


// Получить расписание группы
export async function GetGroupSchedule(date: Date, group: string) {
  const week = date.getWeek()
  const year = date.getFullYear()
  const fDate = format(date, 'dd.MM.yyyy')
  {
    const data = window.localStorage.getItem(`group-schedule-${group}-${week}-${year}`);
    if (data) {
      const parsed = JSON.parse(data) as {
        timestamp: number;
        schedule: Schedule[];
      }

      // Если расписание не устарело
      if (parsed.timestamp != undefined && parsed.timestamp + 1000 > Date.now()) {
        return parsed.schedule;
      }
    }
  }

  const href = `/schedule?key=VK&group=${group}&date=${fDate}`;
  const schedule = await sendRequest(href) as Schedule[];

  const timestamp = Date.now();
  window.localStorage.setItem(`group-schedule-${group}-${week}-${year}`, JSON.stringify({timestamp, schedule}));

  return schedule;
}

// Получить расписание преподавателя
export async function GetTeacherSchedule(date: Date, teacher: string) {
  const week = date.getWeek()
  const year = date.getFullYear()
  const fDate = format(date, 'dd.MM.yyyy')
  {
    const data = window.localStorage.getItem(`teacher-schedule-${teacher}-${week}-${year}`);
    if (data) {
      const parsed = JSON.parse(data) as {
        timestamp: number;
        schedule: Schedule[];
      };

      // Если расписание не устарело
      if (parsed.timestamp != undefined && parsed.timestamp + 1000 > Date.now()) {
        return parsed.schedule;
      }
    }
  }

  const href = `/schedule?key=VK&teacher=${teacher}&date=${fDate}`;
  const schedule = await sendRequest(href) as Schedule[];

  const timestamp = Date.now();
  window.localStorage.setItem(`teacher-schedule-${teacher}-${week}-${year}`, JSON.stringify({timestamp, schedule}));

  return schedule;
}

// Получить группы
export async function GetGroups() {
  const groups = window.localStorage.getItem('groups')
  if (groups) {
    return JSON.parse(groups) as Option[]
  }

  const href = '/groups'
  const data = await sendRequest(href) as Option[]
  window.localStorage.setItem('groups', JSON.stringify(data))

  return data
}

// Получить преподавателей
export async function GetTeachers() {
  const teachers = window.localStorage.getItem('teachers')
  if (teachers) {
    return JSON.parse(teachers) as Option[]
  }

  const href = '/teachers'
  const data = await sendRequest(href) as Option[]
  window.localStorage.setItem('teachers', JSON.stringify(data))

  return data
}

// Удалить информацию о показе slides sheet
export async function DeleteSlidesSheet() {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'slidesSheet',
    value: ''
  })

  return response.result
}

// Сохранить информацию о показе slides sheet
export async function SaveSlidesSheet(slidesSheet: boolean) {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'slidesSheet',
    value: JSON.stringify(slidesSheet)
  })

  return response.result
}

// Получить информацию о показе slides sheet
export async function GetSlidesSheet() {
  const response = await bridge.send('VKWebAppStorageGet', {
    keys: ['slidesSheet']
  })

  return JSON.parse(response.keys[0].value) as boolean
}

// Отправить пользователю slides sheet
export function SendSlidesSheet() {
  return bridge.send('VKWebAppShowSlidesSheet', {
    slides: [
      {
        media: {
          blob: base64.one,
          type: 'image'
        },
        title: config.onboardings.one.title,
        subtitle: config.onboardings.one.subtitle
      },
      {
        media: {
          blob: base64.two,
          type: 'image'
        },
        title: config.onboardings.two.title,
        subtitle: config.onboardings.two.subtitle
      },
      {
        media: {
          blob: base64.three,
          type: 'image'
        },
        title: config.onboardings.three.title,
        subtitle: config.onboardings.three.subtitle
      },
      {
        media: {
          blob: base64.four,
          type: 'image'
        },
        title: config.onboardings.four.title,
        subtitle: config.onboardings.four.subtitle
      },
      {
        media: {
          blob: base64.five,
          type: 'image'
        },
        title: config.onboardings.five.title,
        subtitle: config.onboardings.five.subtitle
      },
      {
        media: {
          blob: base64.six,
          type: 'image'
        },
        title: config.onboardings.six.title,
        subtitle: config.onboardings.six.subtitle
      },
      {
        media: {
          blob: base64.seven,
          type: 'image'
        },
        title: config.onboardings.seven.title,
        subtitle: config.onboardings.seven.subtitle
      }
    ]
  })

}

// Сохранить пользовательские настройки
export async function SaveUserSettings(userSettings: UserSettings) {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'schedule',
    value: JSON.stringify(userSettings)
  })

  return response.result
}

// Получить пользовательские настройки
export async function GetUserSettings() {
  const response = await bridge.send('VKWebAppStorageGet', {
    keys: ['schedule']
  })

  return JSON.parse(response.keys[0].value) as UserSettings
}

// Удалить пользовательские настройки
export async function DeleteUserSettings() {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'schedule',
    value: ''
  })

  return response.result
}