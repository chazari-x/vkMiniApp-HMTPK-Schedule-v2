import vkBridge, {parseURLSearchParamsForGetLaunchParams} from '@vkontakte/vk-bridge';
import {useAdaptivity, useAppearance, useInsets} from '@vkontakte/vk-bridge-react';
import {AdaptivityProvider, AppRoot, ConfigProvider} from '@vkontakte/vkui';
import {RouterProvider} from '@vkontakte/vk-mini-apps-router';
import '@vkontakte/vkui/dist/vkui.css';
import {transformVKBridgeAdaptivity} from './utils';
import {router} from './routes';
import {App} from './App';
import {createTheme, ThemeProvider} from "@mui/material";
import "./App.scss";
import {useEffect} from "react";
import {
  AppAddToHomeScreen,
  AppAddToHomeScreenInfo,
  AppJoinGroup,
  AppRecommend,
  GetSlidesSheet,
  SaveSlidesSheet,
  SendSlidesSheet
} from "./api/api.ts";
import {NewSchedule} from "./types.ts";

declare global {
  interface Date {
    getWeek(): number;
  }

  interface Window {
    schedule: Record<string, NewSchedule | undefined>
  }
}

export const AppConfig = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const {vk_platform, vk_is_recommended} = parseURLSearchParamsForGetLaunchParams(window.location.search);

  useEffect(() => {
    window.schedule = {}

    GetSlidesSheet()
      .then((showed) => {
        if (!showed) SendSlidesSheet()
          .then((data) => {
            if (data.result) SaveSlidesSheet(data.action === "confirm")
          })
          .catch(console.error);
        else vk_is_recommended == 1 ? (
          AppAddToHomeScreenInfo()
            .then((status) => {
              if (status) AppAddToHomeScreen()
              else AppJoinGroup()
            })
        ) : AppRecommend()
      })
      .catch(() => SendSlidesSheet()
        .then((data) => {
          if (data.result) SaveSlidesSheet(data.action === "confirm")
        })
        .catch(console.error)
      )
  }, []);

  const darkTheme = createTheme({
    palette: {mode: vkBridgeAppearance},
  });

  return (
    <ConfigProvider
      appearance={vkBridgeAppearance}
      platform={vk_platform === 'desktop_web' ? 'vkcom' : undefined}
      isWebView={vkBridge.isWebView()}
      hasCustomPanelHeaderAfter={true}
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot mode="full" safeAreaInsets={vkBridgeInsets}>
          <ThemeProvider theme={darkTheme}>
            <RouterProvider router={router}>
              <App/>
            </RouterProvider>
          </ThemeProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};
