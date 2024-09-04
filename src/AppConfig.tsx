import vkBridge from '@vkontakte/vk-bridge';
import bridge, {parseURLSearchParamsForGetLaunchParams} from '@vkontakte/vk-bridge';
import {useAdaptivity, useAppearance, useInsets} from '@vkontakte/vk-bridge-react';
import {AdaptivityProvider, AppRoot, ConfigProvider} from '@vkontakte/vkui';
import {RouterProvider} from '@vkontakte/vk-mini-apps-router';
import '@vkontakte/vkui/dist/vkui.css';

import {transformVKBridgeAdaptivity} from './utils';
import {router} from './routes';
import {App} from './App';
import {createTheme, ThemeProvider} from "@mui/material";
import "./App.scss";

import config from './etc/config.json';
import {useEffect} from "react";
import {GetSlidesSheet, SaveSlidesSheet, SendSlidesSheet} from "./api/api.ts";

declare global {
  interface Date {
    getWeek(): number;
  }
}

export const AppConfig = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const {vk_platform} = parseURLSearchParamsForGetLaunchParams(window.location.search);

  useEffect(() => {
    bridge.supportsAsync("VKWebAppJoinGroup").then(res => {
      if (res) {
        setTimeout(() => {
          bridge.send('VKWebAppJoinGroup', {
            group_id: config.group.id
          })
        }, 5000)
      }
    });

    GetSlidesSheet()
      .then((showed) => {
        if (!showed) SendSlidesSheet(vkBridgeAppearance)
          .then((data) => {
            if (data.result) {
              SaveSlidesSheet(data.action === "confirm")
            }
          })
          .catch(console.error);
      })
      .catch(() => SendSlidesSheet(vkBridgeAppearance)
        .then((data) => {
          if (data.result) {
            SaveSlidesSheet(data.action === "confirm")
          }
        })
        .catch(console.error)
      )
  }, []);

  const darkTheme = createTheme({
    palette: {
      mode: vkBridgeAppearance, // Устанавливаем темную тему
    },
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
