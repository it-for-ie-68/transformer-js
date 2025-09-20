if (window.Worker) {
  const worker = new Worker("worker.js");
  worker.postMessage("Hi from main");
  console.log("Post message to worker");

  worker.addEventListener("message", (e) => {
    console.log("Receive message from worker");
    console.log(e);
  });
}
