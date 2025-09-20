import {
  pipeline,
  TextStreamer,
  type TranslationPipeline,
  type ProgressCallback,
} from "@huggingface/transformers";
import {
  type PayloadFromWorker,
  type PayloadFromMain,
  type Language,
} from "./types";
class Model {
  static task = "translation";
  static model = "Xenova/nllb-200-distilled-600M";
  static modelOptions = { dtype: "q8", device: "wasm" };

  private static instance: TranslationPipeline | null = null;
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

function getLanguageCode(lang: Language) {
  const langMap: { [key: string]: string } = {
    en: "eng_Latn",
    fr: "fra_Latn",
    es: "spa_Latn",
    th: "tha_Thai",
  };
  return langMap[lang] || "eng_Latn";
}

onmessage = async (e: MessageEvent<PayloadFromMain>) => {
  postMessage({
    status: "start_generate_text",
    payload: "",
  } as PayloadFromWorker);

  const translator = await Model.getInstance((_info) => {
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
  if (!translator) return;

  const streamer = new TextStreamer(translator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: function (text) {
      postMessage({
        status: "update_text",
        payload: text,
      } as PayloadFromWorker);
    },
  });

  let messages: string = e.data.inputText;

  await translator(messages, {
    // @ts-ignore
    src_lang: getLanguageCode(e.data.srcLang),
    tgt_lang: getLanguageCode(e.data.tgtLang),
    streamer: streamer,
  });

  postMessage({
    status: "done_generate_text",
    payload: "",
  } as PayloadFromWorker);
};
