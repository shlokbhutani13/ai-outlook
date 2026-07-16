(function expose(root, factory) {
  const api = factory();
  if (typeof module !== "undefined") module.exports = api;
  if (root) root.AIOutlookTaskPane = api;
})(typeof window !== "undefined" ? window : null, () => {
  function initializeTaskPane({ document, officeAdapter, fetchImpl = fetch }) {
    const generate = document.getElementById("generate");
    const status = document.getElementById("status");
    const result = document.getElementById("result");
    const reply = document.getElementById("reply");
    const tone = () => document.querySelector('input[name="tone"]:checked').value;

    generate.addEventListener("click", async () => {
      generate.disabled = true;
      status.textContent = "Reading the message…";
      try {
        const email = await officeAdapter.readMessageText();
        status.textContent = "Drafting a reply…";
        const response = await fetchImpl("/api/replies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, tone: tone() }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Reply generation failed.");
        reply.value = data.reply;
        result.hidden = false;
        status.textContent = "Draft ready for review.";
      } catch (error) {
        status.textContent = error.message || "Reply generation failed.";
      } finally {
        generate.disabled = false;
      }
    });

    document.getElementById("copy").addEventListener("click", async () => {
      await navigator.clipboard.writeText(reply.value);
      status.textContent = "Reply copied.";
    });
    document.getElementById("open-reply").addEventListener("click", async () => {
      try {
        await officeAdapter.openReply(reply.value);
        status.textContent = "Reply draft opened in Outlook.";
      } catch (error) {
        status.textContent = error.message;
      }
    });
  }
  return { initializeTaskPane };
});

if (typeof window !== "undefined" && window.Office) {
  Office.onReady(() => {
    const adapter = window.AIOutlookOffice.createOfficeAdapter(window.Office);
    window.AIOutlookTaskPane.initializeTaskPane({ document, officeAdapter: adapter });
  });
}
