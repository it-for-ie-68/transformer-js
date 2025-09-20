onmessage = (e) => {
  console.log("Message received from main script");
  console.log(e);
  console.log("Posting message back to main script");
  postMessage("Hi from worker");

  let i = 0;
  setInterval(() => {
    postMessage(i);
    i = i + 1;
  }, 500);
};
