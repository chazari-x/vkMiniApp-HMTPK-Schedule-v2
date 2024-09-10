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
  interface Window {
    vk_user_id: number | undefined;
    vk_is_recommended: number | undefined;
  }

  interface Date {
    getWeek(): number;
  }
}

export const AppConfig = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const {vk_platform, vk_is_recommended, vk_user_id} = parseURLSearchParamsForGetLaunchParams(window.location.search);

  useEffect(() => {
    window.vk_user_id = vk_user_id
    window.vk_is_recommended = vk_is_recommended

    console.log(window.vk_user_id, window.vk_is_recommended)

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
        if (!showed) SendSlidesSheet()
          .then((data) => {
            if (data.result) SaveSlidesSheet(data.action === "confirm")
          })
          .catch(console.error);
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
