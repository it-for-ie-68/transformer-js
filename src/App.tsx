import { useState, useEffect, useRef } from "react";
import {
  type ModelStatus,
  type PayloadFromWorker,
  type PayloadFromMain,
} from "./types";

const CONTEXT = "You are a helpful assistant.";

function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: "initiate",
    progress: 0,
  });
  const [outputText, setOutputText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const worker = useRef<Worker>(null);

  useEffect(() => {
    // Create the worker if it does not yet exist.
    worker.current ??= new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent<PayloadFromWorker>) => {
      switch (e.data.status) {
        case "load_model":
          if (typeof e.data.payload === "string") break;
          setModelStatus(e.data.payload);
          break;
        case "start_generate_text":
          setIsLoading(true);
          break;
        case "update_text":
          if (typeof e.data.payload !== "string") break;
          setOutputText((prev) => prev + e.data.payload);
          break;
        case "done_generate_text":
          setIsLoading(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  });

  function handleType(e: any) {
    setInputText(e.target.value.trim());
  }

  async function handleSubmit() {
    if (!inputText || !worker.current) return;
    setOutputText("");
    worker.current.postMessage({
      inputText,
      context: CONTEXT,
    } as PayloadFromMain);
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="container">
      <h1>Text Generation</h1>
      <input type="text" onChange={handleType} onKeyDown={handleKeyDown} />
      <button onClick={handleSubmit} aria-busy={isLoading} disabled={isLoading}>
        Submit
      </button>
      <div
        aria-busy={modelStatus.status === "progress"}
        style={{ textTransform: "capitalize", fontSize: "0.8rem" }}
      >
        Model Status: {modelStatus.status} - {modelStatus.progress}%
      </div>
      {outputText && <article>{outputText}</article>}
    </div>
  );
}

export default App;
