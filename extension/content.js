console.log("Gmail AI extension loaded");

function waitForBody() {
  if (!document.body) {
    setTimeout(waitForBody, 500);
    return;
  }
  injectButton();
}

function injectButton() {
  if (document.getElementById("ai-reply-btn")) return;

  const button = document.createElement("button");
  button.id = "ai-reply-btn";
  button.innerText = "AI Reply";

  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "999999";
  button.style.padding = "12px 16px";
  button.style.background = "#0b57d0";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "10px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
  button.style.fontSize = "14px";
  button.style.fontWeight = "600";

  button.onclick = async () => {
    try {
      const emailBody = document.querySelector("div[role='main']");

      if (!emailBody) {
        alert("Open an email first");
        return;
      }

      const response = await fetch("http://localhost:5051/ai-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailBody.innerText })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      showPopup(data.reply);
    } catch (err) {
      console.error("Button click error:", err);
      alert(err.message || "Error connecting to AI server");
    }
  };

  document.body.appendChild(button);
  console.log("Button injected");
}

function showPopup(text) {
  const oldPopup = document.getElementById("ai-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "ai-popup";

  popup.style.position = "fixed";
  popup.style.bottom = "80px";
  popup.style.right = "20px";
  popup.style.width = "360px";
  popup.style.maxWidth = "90vw";
  popup.style.background = "#1f1f1f";
  popup.style.color = "#ffffff";
  popup.style.padding = "16px";
  popup.style.borderRadius = "14px";
  popup.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
  popup.style.zIndex = "1000000";
  popup.style.fontFamily = "Arial, sans-serif";

  popup.innerHTML = `
    <div style="font-size:16px; font-weight:700; margin-bottom:10px;">
      AI Reply
    </div>

    <textarea
      id="ai-text"
      style="
        width:100%;
        height:160px;
        resize:vertical;
        border:none;
        outline:none;
        border-radius:10px;
        padding:12px;
        box-sizing:border-box;
        font-size:14px;
        line-height:1.5;
        background:#2b2b2b;
        color:white;
      "
    ></textarea>

    <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
      <button
        id="copy-btn"
        style="
          background:#0b57d0;
          color:white;
          border:none;
          border-radius:8px;
          padding:10px 14px;
          cursor:pointer;
          font-weight:600;
        "
      >
        Copy
      </button>

      <button
        id="close-btn"
        style="
          background:#444;
          color:white;
          border:none;
          border-radius:8px;
          padding:10px 14px;
          cursor:pointer;
          font-weight:600;
        "
      >
        Close
      </button>
    </div>
  `;

  document.body.appendChild(popup);

  const textarea = document.getElementById("ai-text");
  textarea.value = text;

  document.getElementById("copy-btn").onclick = async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      const copyBtn = document.getElementById("copy-btn");
      const oldText = copyBtn.innerText;
      copyBtn.innerText = "Copied";
      setTimeout(() => {
        copyBtn.innerText = oldText;
      }, 1200);
    } catch (err) {
      textarea.select();
      document.execCommand("copy");
      alert("Copied");
    }
  };

  document.getElementById("close-btn").onclick = () => {
    popup.remove();
  };
}

waitForBody();