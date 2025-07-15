const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function matchCasing(text, pattern) {
  const isAllCaps = pattern === pattern.toUpperCase();
  const isAllLower = pattern === pattern.toLowerCase();
  const isTitleCase = pattern.split(' ').every(word => 
    word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()
  );

  if (isAllCaps) {
    return text.toUpperCase();
  } else if (isAllLower) {
    return text.toLowerCase();
  } else if (isTitleCase) {
    return text.split(' ').map(word =>
      word[0].toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  return text;
}


let wordsToReplace = {};

async function fetchWordsToReplace() {
  const url = "https://raw.githubusercontent.com/Yarrtt/jojo-sub-swap/df6c16b3550bcf12460525bd660082aaf870187d/subs.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    wordsToReplace = await response.json();
    startObserver();
    replaceTextNodes(document.body);
  } catch (err) {
    console.error("Could not fetch wordsToReplace:", err);
  }
}

const replaceTextNodes = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    Object.entries(wordsToReplace).forEach(([oldWord, newWord]) => {
      const escapedOldWord = escapeRegExp(oldWord);
      const regex = new RegExp(escapedOldWord, 'gi');

      if (regex.test(node.textContent)) {
        node.textContent = node.textContent.replace(regex, (match) => {
          if (oldWord === "F.F.") {
            return "Foo Fighters";
          }
          return matchCasing(newWord, match);
          
        });
      }
    });
  } else {
    node.childNodes.forEach(replaceTextNodes);
  }
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      replaceTextNodes(node);
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
fetchWordsToReplace();

