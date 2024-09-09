import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  MySchedule: 'my_schedule',
  GroupSchedule: 'group_schedule',
  TeacherSchedule: 'teacher_schedule',
  Settings: 'settings',
  Information: 'information',
  GroupSelector: 'group_selector',
  TeacherSelector: 'teacher_selector',
  Announce: 'announce',
  News: 'news',
  College: 'college',
  Abitur: 'abitur'
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.MySchedule, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.GroupSchedule, `/${DEFAULT_VIEW_PANELS.GroupSchedule}`, []),
      createPanel(DEFAULT_VIEW_PANELS.TeacherSchedule, `/${DEFAULT_VIEW_PANELS.TeacherSchedule}`, []),
      createPanel(DEFAULT_VIEW_PANELS.Settings, `/${DEFAULT_VIEW_PANELS.Settings}`, []),
      createPanel(DEFAULT_VIEW_PANELS.Information, `/${DEFAULT_VIEW_PANELS.Information}`, []),
      createPanel(DEFAULT_VIEW_PANELS.GroupSelector, `/${DEFAULT_VIEW_PANELS.GroupSelector}`, []),
      createPanel(DEFAULT_VIEW_PANELS.TeacherSelector, `/${DEFAULT_VIEW_PANELS.TeacherSelector}`, []),
      createPanel(DEFAULT_VIEW_PANELS.Announce, `/${DEFAULT_VIEW_PANELS.Announce}`, []),
      createPanel(DEFAULT_VIEW_PANELS.News, `/${DEFAULT_VIEW_PANELS.News}`, []),
      createPanel(DEFAULT_VIEW_PANELS.College, `/${DEFAULT_VIEW_PANELS.College}`, []),
      createPanel(DEFAULT_VIEW_PANELS.Abitur, `/${DEFAULT_VIEW_PANELS.Abitur}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
