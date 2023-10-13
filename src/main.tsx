import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import {
  BrandVariants,
  FluentProvider,
  Theme,
  createDarkTheme,
  createLightTheme
} from "@fluentui/react-components";

const appTheme: BrandVariants = {
  10: "#020206",
  20: "#131627",
  30: "#1A2346",
  40: "#1E2E60",
  50: "#203A7C",
  60: "#214699",
  70: "#2052B6",
  80: "#3F5FBD",
  90: "#556DC3",
  100: "#697BCA",
  110: "#7C89D0",
  120: "#8E98D7",
  130: "#9FA6DD",
  140: "#B1B6E3",
  150: "#C2C5E9",
  160: "#D3D5F0",
};

const lightTheme: Theme = {
  ...createLightTheme(appTheme),
};

const darkTheme: Theme = {
  ...createDarkTheme(appTheme),
};

darkTheme.colorBrandForeground1 = appTheme[110];
darkTheme.colorBrandForeground2 = appTheme[120];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <FluentProvider
    theme={{ ...lightTheme }}
    style={{ background: "transparent", borderRadius: 12, height: "100vh" }}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </FluentProvider>
);
