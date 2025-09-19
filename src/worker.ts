import {
  pipeline,
  TextStreamer,
  type TextGenerationPipeline,
  type ProgressCallback,
  type ProgressInfo,
} from "@huggingface/transformers";

class Model {
  static task = "text-generation" as const;
  static model = "HuggingFaceTB/SmolLM2-135M-Instruct";
  private static instance: TextGenerationPipeline | null = null;
  public static async getInstance(progress_callback: ProgressCallback) {
    if (!this.instance) {
      // @ts-ignore
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

onmessage = async (e) => {
  // console.log("Worker: Message received from main script");

  postMessage({ status: "start_generate_text", payload: "" });

  // const result = e.data[0] * e.data[1];
  const inputText = (e.data["inputText"] as string) ?? "";

  const generator = await Model.getInstance((_info) => {
    if (_info.status !== "progress") {
      console.log(_info);
    }

    let progress: number;
    if (_info.status === "done" || _info.status === "ready") {
      progress = 100;
    } else if (_info.status === "progress") {
      progress = _info.progress;
    } else {
      progress = 0;
    }
    const payload = { status: _info.status, progress };
    postMessage({ status: "load_model", payload: payload });
  });

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: function (text) {
      // setOutputText((prev) => prev + text);
      // console.log(text);
      postMessage({ status: "update_text", payload: text });
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

  postMessage({ status: "done_generate_text", payload: "" });

  // if (isNaN(result)) {
  //   postMessage("Please write two numbers");
  // } else {
  //   const workerResult = "Result: " + result;
  //   console.log("Worker: Posting message back to main script");
  //   postMessage(workerResult);
  // }
};
