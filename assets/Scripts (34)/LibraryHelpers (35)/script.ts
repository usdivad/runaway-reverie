function addExternalScript(scriptName: string, links: Object, linkType: string, window) {
  var script = window.document.createElement("script");
  script.src = links[scriptName][linkType];
  window.document.body.appendChild(script);
}