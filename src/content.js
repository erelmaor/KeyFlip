chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.action !== "fixSelection") return;
  try {
    const active = document.activeElement;

    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      typeof active.selectionStart === "number") {
      const start = active.selectionStart;
      const end = active.selectionEnd;

      if (start === end) return;
      const selectedText = active.value.substring(start, end);
      const converted = convert(selectedText);

      if (typeof active.setRangeText === "function") {
        active.setRangeText(converted, start, end, "end");
      } else {
        active.value = active.value.slice(0, start) + converted + active.value.slice(end);
        const caret = start + converted.length;
        active.selectionStart = active.selectionEnd = caret;
      }
      active.focus();

      return;
    }

    if (active && active.isContentEditable) {
      const sel = window.getSelection();

      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const selectedText = sel.toString();

      if (!selectedText) return;
      const converted = convert(selectedText);

      range.deleteContents();
      range.insertNode(document.createTextNode(converted));

      sel.removeAllRanges();

      return;
    }

    const sel = window.getSelection();

    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = sel.toString();

    if (!selectedText) return;
    const converted = convert(selectedText);

    range.deleteContents();
    range.insertNode(document.createTextNode(converted));

    sel.removeAllRanges();
  } catch (err) {
    console.error("KeyFlip: error in content.js", err);
  }
});