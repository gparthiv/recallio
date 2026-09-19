chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "GET_SELECTION_HTML") {
    return;
  }

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    sendResponse({
      text: "",
      html: "",
    });
    return;
  }

  const range = selection.getRangeAt(0);

  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  sendResponse({
    text: selection.toString(),
    html: container.innerHTML,
  });
});