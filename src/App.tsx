import { useState, useEffect, useRef } from "react";
import {
  type ModelStatus,
  type PayloadFromWorker,
  type PayloadFromMain,
  type Language,
  languages,
} from "./types";

function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: "initiate",
    progress: 0,
    modelName: "",
  });
  const [outputText, setOutputText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [srcLang, setSrcLang] = useState<Language>("en");
  const [tgtLang, setTgtLang] = useState<Language>("th");
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
      srcLang,
      tgtLang,
    } as PayloadFromMain);
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  function handleSelect(e: any) {
    const value = e.target.value as Language;
    if (!languages.includes(value)) return;
    if (e.target.name === "srcLang") {
      setSrcLang(value);
    } else if (e.target.name === "tgtLang") {
      setTgtLang(value);
    } else {
      console.log("Unknown");
    }
  }

  return (
    <div className="container">
      <h1>Text Translation</h1>
      <div className="grid">
        <div>
          <label htmlFor="srcLang">Source</label>
          <select
            name="srcLang"
            id="srcLang"
            value={srcLang}
            onChange={handleSelect}
          >
            <option value="en">English</option>
            <option value="th">Thai</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div>
          <label htmlFor="tgtLang">Target</label>
          <select
            name="tgtLang"
            id="tgtLang"
            value={tgtLang}
            onChange={handleSelect}
          >
            <option value="en">English</option>
            <option value="th">Thai</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>
      <label htmlFor="input">Input</label>
      <input
        id="input"
        type="text"
        onChange={handleType}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        aria-busy={isLoading}
        disabled={isLoading}
        style={{ marginBottom: "1rem" }}
      >
        Submit
      </button>
      {modelStatus.modelName && (
        <div>
          <kbd
            aria-busy={modelStatus.status === "progress"}
            style={{ textTransform: "capitalize" }}
          >
            {modelStatus.modelName} ({modelStatus.status}:{modelStatus.progress}
            %)
          </kbd>
        </div>
      )}
      {outputText && <article>{outputText}</article>}
    </div>
  );
}

export default App;
