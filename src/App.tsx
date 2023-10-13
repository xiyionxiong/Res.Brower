import "./App.css";
import { WebviewWindow } from "@tauri-apps/api/window";

import { createScheduler, createWorker } from "tesseract.js";

function App() {
  return (
    <>
      <p className="read-the-docs">试试就试试。</p>

      <button
        type="button"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.addEventListener("change", async (e) => {
            console.log(input.files);
            if (input.files!.length === 0) return;
            const file = input.files![0];

            // const worker = await createWorker("eng+chi_sim");

            const scheduler = createScheduler();
            const worker1 = await createWorker("eng");
            const worker2 = await createWorker("eng");
            scheduler.addWorker(worker1);
            scheduler.addWorker(worker2);
            /** Add 10 recognition jobs */
            const results = await Promise.all(
              Array(10)
                .fill(0)
                .map(() => scheduler.addJob("recognize", file))
            );
            console.log(results);
            await scheduler.terminate(); // It also terminates all workers.

            // const data = await worker.recognize(file);
            // console.log(data);
            // await worker.terminate();
          });
          input.click();
        }}
      >
        选择图片
      </button>

      <button
        onClick={() => {
          const webview = new WebviewWindow("my-label", {
            url: "src/app.html",
            transparent: false,
            resizable: true,
            decorations: false,
            width: 375,
            height: 667,
          });

          localStorage.setItem("my", "i love u");

          webview.once("tauri://created", function () {
            // webview window successfully created

            console.log("created>>");
          });
          webview.once("tauri://error", function (e) {
            // an error happened creating the webview window
            console.log("error>>", e);
          });
        }}
      >
        打开子页面
      </button>
    </>
  );
}

export default App;
