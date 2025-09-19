import { useState, useEffect, useRef } from "react";

interface ModelStatus {
  status: "done" | "ready" | "progress" | "initiate" | "download";
  progress: number;
}

function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: "initiate",
    progress: 0,
  });
  const [outputText, setOutputText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const worker = useRef(null);

  useEffect(() => {
    // Create the worker if it does not yet exist.
    worker.current ??= new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "load_model":
          setModelStatus(e.data.payload);
          break;
        case "start_generate_text":
          setIsLoading(true);
          break;
        case "update_text":
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
      worker.current.removeEventListener("message", onMessageReceived);
  });

  function handleType(e: any) {
    setInputText(e.target.value.trim());
  }

  async function handleSubmit() {
    if (!inputText) return;
    setOutputText("");
    worker.current.postMessage({ inputText });
  }

  return (
    <div className="container">
      <h1>Text Generation</h1>
      <input type="text" onChange={handleType} />
      <button onClick={handleSubmit} disabled={isLoading}>
        Submit
      </button>
      {outputText && <article>{outputText}</article>}
      <article>
        Model Status: {modelStatus.status} - {modelStatus.progress} %
      </article>
    </div>
  );
}

export default App;
