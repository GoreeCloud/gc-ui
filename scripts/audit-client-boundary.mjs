/**
 * Conservative source-level signals for accidental network/persistence drift.
 * Not a security audit, sandbox or proof of absence of malicious behavior.
 */
const checks=[
  ["network-fetch", /(?:\bfetch\s*\(|\.fetch\s*\()/g],
  ["network-xhr", /\bXMLHttpRequest\s*\(/g],
  ["network-socket", /\bWebSocket\s*\(/g],
  ["network-eventsource", /\bEventSource\s*\(/g],
  ["network-beacon", /\bsendBeacon\s*\(/g],
  ["persistent-localstorage", /\blocalStorage\b/g],
  ["persistent-sessionstorage", /\bsessionStorage\b/g],
  ["persistent-indexeddb", /\bindexedDB\b/g],
  ["persistent-cacheapi", /\bcaches\s*\./g],
  ["persistent-cookie", /\b(?:document|globalThis\.document)\s*\.\s*cookie\b/g],
  ["persistent-serviceworker", /\bserviceWorker\s*\.\s*register\s*\(/g],
  ["remote-dynamic-import", /\bimport\s*\(\s*["'](?:https?:|\/\/)/g],
  ["dynamic-code-eval", /\beval\s*\(/g],
  ["dynamic-code-constructor", /\bnew\s+Function\s*\(/g],
  ["dynamic-document-write", /\bdocument\s*\.\s*write(?:ln)?\s*\(/g],
  ["dynamic-string-timer", /\bset(?:Timeout|Interval)\s*\(\s*["'`]/g],
  ["unsafe-dom-write", /\b(?:innerHTML|outerHTML)\s*=/g]
];
const svgException=/\bthis\.shadowRoot\.innerHTML\s*=\s*iconSvg\(name,\s*\{\s*size,\s*decorative:\s*true\s*\}\s*\);/g;
export function scanClientSource(path,source){
  if(typeof path!=="string"||typeof source!=="string")throw new TypeError("Expected path and source text");
  const findings=[];
  for(const [category,pattern] of checks){
    for(const m of source.matchAll(pattern)){
      if(category==="unsafe-dom-write"&&path==="src/elements.js") {
        svgException.lastIndex=0;
        const allowed=[...source.matchAll(svgException)];
        if(allowed.some(x=>m.index>=x.index&&m.index<x.index+x[0].length))continue;
      }
      findings.push({category,path,offset:m.index});
    }
  }
  return findings;
}
export function scanStylesheet(path,source){
  if(typeof path!=="string"||typeof source!=="string")throw new TypeError("Expected stylesheet text");
  const findings=[];
  for(const m of source.matchAll(/@import\s*(?:url\s*\(\s*)?["']?\s*(?:https?:|\/\/)|url\s*\(\s*["']?\s*(?:https?:|\/\/)/gi)){
    findings.push({category:"remote-stylesheet-resource",path,offset:m.index});
  }
  return findings;
}
