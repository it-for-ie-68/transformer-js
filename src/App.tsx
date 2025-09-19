import {
  // env,
  AutoTokenizer,
  AutoModelForCausalLM,
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
  type ProgressCallback,
} from "@huggingface/transformers";
import { useState, useEffect } from "react";

// class MyTranslationPipeline {
//   static task = "translation";
//   static model = "Xenova/nllb-200-distilled-600M";
//   static instance = null;

//   static async getInstance(progress_callback = null) {
//     this.instance ??= pipeline(this.task, this.model, { progress_callback });
//     return this.instance;
//   }
// }

class SingleModel {
  static task = "text-generation" as const;
  static model = "HuggingFaceTB/SmolLM2-135M-Instruct";
  // private static instance: Awaited<ReturnType<typeof pipeline>> | null = null;
  private static instance: TextGenerationPipeline | null = null;
  public static async getInstance(progress_callback: ProgressCallback) {
    if (!this.instance) {
      this.instance = await pipeline(SingleModel.task, SingleModel.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

const NLLB_LANGUAGE_MAP = {
  en: "eng_Latn",
  fr: "fra_Latn",
  es: "spa_Latn",
  de: "deu_Latn",
  zh: "zho_Hans",
  "zh-TW": "zho_Hant",
  // ...other mappings
};

function getLanguageCode(lang) {
  return NLLB_LANGUAGE_MAP[lang] || "eng_Latn";
}

function App() {
  // async function test() {
  //   // let model_name = "HuggingFaceTB/SmolLM2-135M-Instruct";
  //   // let tokenizer = await AutoTokenizer.from_pretrained(model_name);
  //   // let model = await AutoModelForCausalLM.from_pretrained(model_name, {
  //   //   dtype: "q4f16",
  //   //   device: "wasm",
  //   // });
  //   // let messages = [{ role: "user", content: "What is gravity?" }];
  //   // let input_text = tokenizer.apply_chat_template(messages, {
  //   //   add_generation_prompt: true,
  //   //   return_dict: true,
  //   // });
  //   // console.log({ input_text });
  //   // let outputs = await model.generate(input_text);
  //   // let decoded = tokenizer.decode(outputs, { skip_special_tokens: true });
  //   // console.log("Model Output: ", decoded);
  //   // Allocate a pipeline for sentiment-analysis
  //   // const generator = await pipeline("text-generation", "Xenova/gpt2");
  //   // // Generate text (default parameters)
  //   // const text = "Once upon a time,";
  //   // const output = await generator(text);
  //   // console.log({ output });
  //   // [{'label': 'POSITIVE', 'score': 0.999817686}]
  //   // const generator = await pipeline(
  //   //   "text-generation",
  //   //   "HuggingFaceTB/SmolLM2-135M-Instruct"
  //   // ); // Define the messages for the instruction-tuned model
  //   // const messages = [
  //   //   { role: "system", content: "You are a helpful AI assistant." },
  //   //   { role: "user", content: "What is actor critic in RL?" },
  //   // ];
  //   // // Generate a response with a maximum of 128 new tokens
  //   // const output = await generator(messages, { max_new_tokens: 128 });
  //   // console.log(output);
  // }

  const [translator, setTranslator] = useState<any>(null);
  useEffect(() => {
    async function run() {
      const translator = await MyTranslationPipeline.getInstance((x) => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        console.log("here");
        console.log(x);
      });

      // setTranslator(translator);

      if (translator) {
        const result = await translator("Hello I am fine thankyou", {
          src_lang: getLanguageCode("en"),
          tgt_lang: getLanguageCode("fr"),
        });
        console.log({ result });
      }
    }

    async function run2() {
      const generator = await SingleModel.getInstance((x) => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        console.log(x);
      });

      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: function (text) {
          console.log(text);
          // self.postMessage({
          //   status: "update",
          //   output: text,
          // });
        },
      });
      // setTranslator(translator);
      const prompt =
        "Once upon a time, in a land far away, there lived a brave knight who";
      if (generator) {
        const result = await generator(prompt, {
          max_new_tokens: 50, // Limit the length of the generated text
          temperature: 0.7, // Control the randomness of the generation
          streamer: streamer,
        });
        // console.log({ result });

        // const result2 = await generator(result[0].generated_text, {
        //   max_new_tokens: 50, // Limit the length of the generated text
        //   temperature: 0.7, // Control the randomness of the generation
        // });
        // console.log({ result2 });
      }
    }

    run2();
  }, []);

  // test();
  return <></>;
}

export default App;
