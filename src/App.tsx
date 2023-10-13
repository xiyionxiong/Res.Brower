import {
  Card,
  Tab,
  TabList,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";

import {
  Cloud48Filled,
  ContentViewGalleryFilled,
  Settings16Filled,
} from "@fluentui/react-icons";
import "./App.css";

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "calc(100vh - 22px)",
  },

  hello: {
    backgroundColor: "#f6f6f6ba",
    ...shorthands.margin("0", "12px", "", ""),
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("12px"),
    ...shorthands.flex(1),
    ...shorthands.border("1px", "solid", "#f6f6f6ba"),
    // boxShadow: "inset 0 0 0 3000px rgba(255,255,255,0.3)",
  },
});

function App() {
  const styles = useStyles();

  return (
    <div>
      <div
        data-tauri-drag-region
        style={{
          height: "10px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "12px 12px 0 0",
        }}
      ></div>
      <div className={styles.root}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TabList
            defaultSelectedValue="tab2"
            vertical
            style={{ background: "transparent", color: "white" }}
          >
            <Tab
              icon={<Cloud48Filled />}
              value="tab1"
              style={{ color: "white" }}
            >
              上传
            </Tab>

            <Tab icon={<ContentViewGalleryFilled />} value="tab2">
              相册
            </Tab>
          </TabList>

          <div style={{ flex: 1 }} />

          <TabList
            vertical
            style={{ background: "transparent", color: "white" }}
          >
            <Tab icon={<Settings16Filled />} value="tab4">
              设置
            </Tab>
          </TabList>
        </div>

        <Card className={styles.hello}>content</Card>
      </div>
    </div>
  );
}

export default App;
