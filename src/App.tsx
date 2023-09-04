import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  function loadScript(url: string, callback: Function) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
      callback();
    };
    script.src = url;
    document.body.append(script);
  }

  useEffect(() => {
    // 动态加载js
    loadScript(
      "https://sf3-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.2.js",
      function () {
        console.log("加载完成");
        var goto =
          "https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a4cd89c3fcfe900b&redirect_uri=http://192.168.1.24:3001/code&response_type=code&state=Res.Brower";
        // @ts-ignore
        var QRLoginObj = QRLogin({
          id: "login_container",
          goto,
          width: "500",
          height: "500",
          style: "width:500px;height:600px", //可选的，二维码html标签的style属性
        });

        var handleMessage = function (event: any) {
          var origin = event.origin;
          // 使用 matchOrigin 方法来判断 message 来自页面的url是否合法
          if (QRLoginObj.matchOrigin(origin)) {
            var loginTmpCode = event.data;
            console.log("loginTmpCode》》》", loginTmpCode);
            // 在授权页面地址上拼接上参数 tmp_code，并跳转
            window.location.href = `${goto}&tmp_code=${loginTmpCode}`;
          }
        };
        if (typeof window.addEventListener != "undefined") {
          window.addEventListener("message", handleMessage, false);
        }
      }
    );
  }, []);

  return (
    <>
      <div id="login_container">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
