import {
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
  type ProgressCallback,
} from "@huggingface/transformers";
import { type PayloadFromWorker } from "./types";
class Model {
  static task = "text-generation" as const;
  static model = "HuggingFaceTB/SmolLM2-135M-Instruct";
  // static model = "HuggingFaceTB/SmolLM2-1.7B-Instruct";
  // static model = "Xenova/gpt2";

  private static instance: TextGenerationPipeline | null = null;
  public static async getInstance(progress_callback: ProgressCallback) {
    if (!this.instance) {
      // @ts-ignore
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
        dtype: "q4",
        device: "wasm",
      });
    }
    return this.instance;
  }
}

interface PayloadFromMain {
  inputText: string;
  context: string;
}

onmessage = async (e: MessageEvent<PayloadFromMain>) => {
  postMessage({
    status: "start_generate_text",
    payload: "",
  } as PayloadFromWorker);

  const generator = await Model.getInstance((_info) => {
    let progress: number;
    if (_info.status === "done" || _info.status === "ready") {
      progress = 100;
    } else if (_info.status === "progress") {
      progress = _info.progress;
    } else {
      progress = 0;
    }
    const payload = { status: _info.status, progress };
    postMessage({
      status: "load_model",
      payload: payload,
    } as PayloadFromWorker);
  });

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: function (text) {
      postMessage({
        status: "update_text",
        payload: text,
      } as PayloadFromWorker);
    },
  });

  const messages = [
    {
      role: "system",
      content: e.data.context ?? "",
    },
    {
      role: "user",
      content: e.data.inputText ?? "",
    },
  ];

  await generator(messages, {
    max_new_tokens: 200, // Limit the length of the generated text
    temperature: 0.7, // Control the randomness of the generation
    streamer: streamer,
  });

  postMessage({
    status: "done_generate_text",
    payload: "",
  } as PayloadFromWorker);
};
