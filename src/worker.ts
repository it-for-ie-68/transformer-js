import {
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
  type ProgressCallback,
  type Message,
} from "@huggingface/transformers";
import { type PayloadFromWorker, type PayloadFromMain } from "./types";
class Model {
  static task = "text-generation" as const;

  // -----------------------------------------------------------
  // static model = "Xenova/distilgpt2";
  // static modelOptions = { device: "wasm" };
  // -----------------------------------------------------------
  static model = "HuggingFaceTB/SmolLM2-135M-Instruct";
  static modelOptions = { device: "wasm" };
  // -----------------------------------------------------------
  // static model = "onnx-community/Phi-3.5-mini-instruct-onnx-web";
  // static modelOptions = { dtype: "q4f16", device: "webgpu" };

  private static instance: TextGenerationPipeline | null = null;
  public static async getInstance(progress_callback: ProgressCallback) {
    if (!this.instance) {
      // @ts-ignore
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
        ...this.modelOptions,
      });
    }
    return this.instance;
  }
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
    const payload = { status: _info.status, progress, modelName: Model.model };
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

  let messages: Message[] | string;
  if (
    Model.model === "HuggingFaceTB/SmolLM2-135M-Instruct" ||
    Model.model === "onnx-community/Phi-3.5-mini-instruct-onnx-web"
  ) {
    messages = [
      {
        role: "system",
        content: e.data.context ?? "",
      },
      {
        role: "user",
        content: e.data.inputText ?? "",
      },
    ];
  } else {
    messages = e.data.inputText;
  }

  await generator(messages, {
    max_new_tokens: 100, // Limit the length of the generated text
    temperature: 0.7, // Control the randomness of the generation
    repetition_penalty: 2.0, // Help prevent model from outputting words in loop.
    streamer: streamer,
  });

  postMessage({
    status: "done_generate_text",
    payload: "",
  } as PayloadFromWorker);
};
