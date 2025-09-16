// mapping.js
const heToEn = {
    "ק": "e", "ר": "r", "א": "t", "ט": "y", "ו": "u", "ן": "i", "ם": "o", "פ": "p",
    "ש": "a", "ד": "s", "ג": "d", "כ": "f", "ע": "g", "י": "h", "ח": "j", "ל": "k", "ך": "l",
    "ז": "z", "ס": "x", "ב": "c", "ה": "v", "נ": "b", "מ": "n", "צ": "m"
  };
  
  const enToHe = {};
  for (const [he, en] of Object.entries(heToEn)) enToHe[en] = he;
  
  function detectDirection(text) {
    let heCount = 0, enCount = 0;
    for (const ch of text) {
      if (heToEn[ch]) heCount++;
      if (enToHe[ch]) enCount++;
    }
    return heCount >= enCount ? "heToEn" : "enToHe";
  }
  
  function convert(text) {
    if (!text) return text;
    const direction = detectDirection(text);
    const mapping = direction === "heToEn" ? heToEn : enToHe;
    return [...text].map(ch => mapping[ch] || ch).join("");
  }  