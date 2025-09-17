import {
  // env,
  AutoTokenizer,
  AutoModelForCausalLM,
  pipeline,
} from "@huggingface/transformers";

function App() {
  async function test() {
    // let model_name = "HuggingFaceTB/SmolLM2-135M-Instruct";

    // let tokenizer = await AutoTokenizer.from_pretrained(model_name);
    // let model = await AutoModelForCausalLM.from_pretrained(model_name, {
    //   dtype: "q4f16",
    //   device: "wasm",
    // });

    // let messages = [{ role: "user", content: "What is gravity?" }];

    // let input_text = tokenizer.apply_chat_template(messages, {
    //   add_generation_prompt: true,
    //   return_dict: true,
    // });

    // console.log({ input_text });
    // let outputs = await model.generate(input_text);
    // let decoded = tokenizer.decode(outputs, { skip_special_tokens: true });
    // console.log("Model Output: ", decoded);

    // Allocate a pipeline for sentiment-analysis
    // const generator = await pipeline("text-generation", "Xenova/gpt2");
    // // Generate text (default parameters)
    // const text = "Once upon a time,";
    // const output = await generator(text);
    // console.log({ output });
    // [{'label': 'POSITIVE', 'score': 0.999817686}]

    const generator = await pipeline(
      "text-generation",
      "HuggingFaceTB/SmolLM2-135M-Instruct"
    ); // Define the messages for the instruction-tuned model
    const messages = [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: "What is actor critic in RL?" },
    ];

    // Generate a response with a maximum of 128 new tokens
    const output = await generator(messages, { max_new_tokens: 128 });

    console.log(output);
  }

  test();
  return <></>;
}

export default App;
