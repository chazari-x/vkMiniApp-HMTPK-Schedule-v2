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
          const data = await response.json()
          if (data.message == "hmtpk not working") {
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

export async function SaveTooltips(tooltips: boolean[]) {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'tooltips',
    value: JSON.stringify(tooltips)
  })

  return response.result
}

export function SaveSlidesSheet(slidesSheet: boolean) {
  bridge.send('VKWebAppStorageSet', {
    key: 'slidesSheet',
    value: JSON.stringify(slidesSheet)
  })
}

export async function GetSlidesSheet() {
  console.log("GetSlidesSheet")

  // const response = await bridge.send('VKWebAppStorageGet', {
  //   keys: ['slidesSheet']
  // })
  //
  // console.log(response.keys[0].value ?? "null")
  //
  // return JSON.parse(response.keys[0].value) as boolean

  return false
}

export function SendSlidesSheet(vkBridgeAppearance: string | undefined) {
  return bridge.send('VKWebAppShowSlidesSheet', {
    slides: [
      {
        media: {
          blob: base64.first,
          type: 'image'
        },
        title: config.onboardings.one.title,
        subtitle: config.onboardings.one.subtitle
      },
      {
        media: {
          blob: vkBridgeAppearance === 'light' ? base64.white.my : base64.dark.my,
          type: 'image'
        },
        title: config.onboardings.two.title,
        subtitle: config.onboardings.two.subtitle
      },
      {
        media: {
          blob: vkBridgeAppearance === 'light' ? base64.white.group : base64.dark.group,
          type: 'image'
        },
        title: config.onboardings.three.title,
        subtitle: config.onboardings.three.subtitle
      },
      {
        media: {
          blob: vkBridgeAppearance === 'light' ? base64.white.teacher : base64.dark.teacher,
          type: 'image'
        },
        title: config.onboardings.four.title,
        subtitle: config.onboardings.four.subtitle
      },
      {
        media: {
          blob: vkBridgeAppearance === 'light' ? base64.white.button : base64.dark.button,
          type: 'image'
        },
        title: config.onboardings.five.title,
        subtitle: config.onboardings.five.subtitle
      }
    ]
  })

}

export async function SaveUserSettings(userSettings: UserSettings) {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'schedule',
    value: JSON.stringify(userSettings)
  })

  return response.result
}

export async function GetUserSettings() {
  const response = await bridge.send('VKWebAppStorageGet', {
    keys: ['schedule']
  })

  return JSON.parse(response.keys[0].value) as UserSettings
}

export async function DeleteUserSettings() {
  const response = await bridge.send('VKWebAppStorageSet', {
    key: 'schedule',
    value: ''
  })

  return response.result
}