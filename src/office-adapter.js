(function expose(root, factory) {
  const api = factory();
  if (typeof module !== "undefined") module.exports = api;
  if (root) root.AIOutlookOffice = api;
})(typeof window !== "undefined" ? window : null, () => {
  function createOfficeAdapter(office) {
    return {
      readMessageText() {
        return new Promise((resolve, reject) => {
          const body = office?.context?.mailbox?.item?.body;
          if (!body?.getAsync) return reject(new Error("Open an email in Outlook first."));
          body.getAsync(office.CoercionType.Text, (result) => {
            if (result.status !== office.AsyncResultStatus.Succeeded) {
              reject(new Error("Outlook could not read this message."));
              return;
            }
            resolve(String(result.value || "").trim());
          });
        });
      },
      openReply(text) {
        return new Promise((resolve, reject) => {
          if (text.length > 32_000) return reject(new Error("The reply is too long for Outlook."));
          const item = office?.context?.mailbox?.item;
          if (!item?.displayReplyFormAsync) {
            return reject(new Error("Outlook cannot open a reply draft here."));
          }
          item.displayReplyFormAsync(text, (result) => {
            if (result.status !== office.AsyncResultStatus.Succeeded) {
              reject(new Error("Outlook could not open the reply draft."));
              return;
            }
            resolve();
          });
        });
      },
    };
  }
  return { createOfficeAdapter };
});
