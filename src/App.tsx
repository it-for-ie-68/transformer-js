import { useState, useEffect } from "react";
import { load_model } from "./model";

function App() {
  const [outputText, setOutputText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // async function test_run() {
    //   const generator = await load_model();
    //   const result = await generator("Hi", {
    //     max_new_tokens: 20, // Limit the length of the generated text
    //     temperature: 0.7, // Control the randomness of the generation
    //     repetition_penalty: 2.0, // Help prevent model from outputting words in loop.
    //   });
    //   console.log(result);
    // }
    // test_run();
  }, []);

  function handleType(e: any) {
    setInputText(e.target.value.trim());
  }

  async function handleSubmit(e: any) {
    if (!inputText) return;
    setIsLoading(true);
    setOutputText("");
    setInputText(e.target.value.trim());
    const generator = await load_model();
    const result = await generator("Hi", {
      max_new_tokens: 20, // Limit the length of the generated text
      temperature: 0.7, // Control the randomness of the generation
      repetition_penalty: 2.0, // Help prevent model from outputting words in loop.
    });
    setOutputText(result[0].generated_text);
    setIsLoading(false);
  }

  return (
    <div className="container">
      <h1>Text Generation Test</h1>
      <input type="text" onChange={handleType} disabled={isLoading} />
      <button
        onClick={handleSubmit}
        aria-busy={isLoading}
        disabled={isLoading}
        style={{ marginBottom: "1rem" }}
      >
        Submit
      </button>
      {outputText && <article>{outputText}</article>}
    </div>
  );
}

export default App;
