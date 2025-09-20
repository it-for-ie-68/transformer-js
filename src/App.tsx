import { useEffect } from "react";
import { pipeline } from "@huggingface/transformers";

function App() {
  useEffect(() => {
    async function run() {
      const generator = await pipeline("text-generation", "Xenova/distilgpt2", {
        progress_callback: (e) => {
          console.log(e);
        },
      });
      const result = await generator("Hi", {
        max_new_tokens: 20, // Limit the length of the generated text
        temperature: 0.7, // Control the randomness of the generation
        repetition_penalty: 2.0, // Help prevent model from outputting words in loop.
      });
      console.log(result);
    }

    run();
  }, []);
  return (
    <div className="container">
      <h1>Text Generation Test</h1>
    </div>
  );
}

export default App;
