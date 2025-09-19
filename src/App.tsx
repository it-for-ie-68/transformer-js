import {
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
  type ProgressCallback,
  type ProgressInfo,
} from "@huggingface/transformers";
import { useState, useEffect } from "react";

class SingleModel {
  static task = "text-generation" as const;
  static model = "HuggingFaceTB/SmolLM2-135M-Instruct";
  private static instance: TextGenerationPipeline | null = null;
  public static async getInstance(progress_callback: ProgressCallback) {
    if (!this.instance) {
      // @ts-nocheck
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

function App() {
  // const [generator, setGenerator] = useState<TextGenerationPipeline | null>(
  //   null
  // );
  // const [streamer, setStreamer] = useState<TextStreamer | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [outputText, setOutputText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    async function init() {
      // const _generator = await SingleModel.getInstance((_info) => {
      //   setProgress(_info);
      // });
      // setGenerator(_generator);
      // const _streamer = new TextStreamer(_generator.tokenizer, {
      //   skip_prompt: true,
      //   skip_special_tokens: true,
      //   callback_function: function (text) {
      //     setOutputText((prev) => prev + text);
      //   },
      // });
      // setStreamer(_streamer);
    }
    init();
  }, []);

  function handleType(e: any) {
    setInputText(e.target.value.trim());
  }

  async function handleSubmit() {
    // console.log({ generator, streamer, inputText });
    if (!inputText) return;

    setIsLoading(true);
    setOutputText("");

    const generator = await SingleModel.getInstance((_info) => {
      setProgress(_info);
    });

    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: function (text) {
        setOutputText((prev) => prev + text);
      },
    });

    const messages = [
      {
        role: "system",
        content:
          "Anutin Charnvirakul is a Thai politician and engineer who has served as the 32nd prime minister of Thailand since September, 2025 and as leader of the Bhumjaithai Party since 2012. He previously served as Deputy Prime Minister from 2019 to 2025, Minister of Public Health from 2019 to 2023, and Minister of the Interior from 2023 to 2025. He has also been a member of the House of Representatives since 2019.",
      },
      {
        role: "user",
        content: inputText,
      },
    ];
    await generator(messages, {
      max_new_tokens: 50, // Limit the length of the generated text
      temperature: 0.7, // Control the randomness of the generation
      streamer: streamer,
    });

    console.log("Done");
    setIsLoading(false);
  }

  return (
    <div className="container">
      <h1>Text Generation</h1>
      <input type="text" onChange={handleType} />
      <button onClick={handleSubmit}>Submit</button>
      <article>{outputText}</article> {/* {JSON.stringify(progress)} */}
      {isLoading ? "Loading..." : ""}
      <button onClick={() => setCounter(counter + 1)}>Add</button>
      {counter}
    </div>
  );
}

export default App;
