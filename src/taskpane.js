Office.onReady(() => {
  document.getElementById("generate").onclick = generateReply;
});

function generateReply() {
  const item = Office.context.mailbox.item;

  item.body.getAsync("text", function (result) {
    const emailText = result.value;

    fetch("http://localhost:3000/ai-reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: emailText })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("output").innerText = data.reply;
      });
  });
}