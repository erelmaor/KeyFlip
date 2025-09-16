// content.js
console.log("KeyFlip content script loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.action !== "fixSelection") return;
  try {
    // 1) If focus is in an input/textarea and there's a selection, replace inside the field
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      typeof active.selectionStart === "number"
    ) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (start === end) return; // no selection
      const selectedText = active.value.substring(start, end);
      const converted = convert(selectedText);
      // replace selection
      // setRangeText preserves undo nicely in most browsers
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

    // 2) If focus is in a contenteditable element
    if (active && active.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const selectedText = sel.toString();
      if (!selectedText) return;
      const converted = convert(selectedText);

      // Replace
      range.deleteContents();
      range.insertNode(document.createTextNode(converted));

      // clear selection (or you can re-select; keeping things simple)
      sel.removeAllRanges();
      return;
    }

    // 3) Normal page selection (paragraphs, spans...)
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = sel.toString();
    if (!selectedText) return;
    const converted = convert(selectedText);

    // Replace the selection with plain text node
    range.deleteContents();
    range.insertNode(document.createTextNode(converted));

    // clear selection (optional)
    sel.removeAllRanges();
  } catch (err) {
    console.error("KeyFlip: error in content.js", err);
  }
});