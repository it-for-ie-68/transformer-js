import { pipeline } from "@huggingface/transformers";
export async function load_model() {
  const generator = await pipeline("text-generation", "Xenova/distilgpt2", {
    progress_callback: (e) => {
      // console.log(e);
    },
  });
  return generator;
}
