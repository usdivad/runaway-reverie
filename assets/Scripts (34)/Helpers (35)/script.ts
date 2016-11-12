// Add script from link (for importing JS libraries and scripts)
function addExternalScript(scriptName: string, links: Object, linkType: string, window):void {
  var script = window.document.createElement("script");
  script.src = links[scriptName][linkType];
  window.document.body.appendChild(script);
}

// Implementation of weighted random choosing (similar to Supercollider's wchoose)
function wchoose(values, weights):any {
  let normalizedWeights = normalizeSum(weights);
  let dice = Math.random();
  let weightSum = 0;
  
  for (var i=0; i<values.length; i++) {
    weightSum += normalizedWeights[i];
    
    // Sup.log("dice:"+dice+", weightSum:"+weightSum+", i:"+i);
    
    if (dice <= weightSum) {
      return values[i];
    }
  }
}

// Normalize sum of an array of numeric values
function normalizeSum(numbers) {
  let sum = 0;
  let normalizedSum = [];
  for (var i=0; i<numbers.length; i++) {
    sum += numbers[i];
  }
  
  for (var i=0; i<numbers.length; i++) {
    normalizedSum.push(numbers[i] / sum);
  }
  return normalizedSum;
}

// Calculate the distance between two actors
function calculateDistanceBetweenActorPositions(pos1: Sup.Math.Vector3, pos2: Sup.Math.Vector3) {
  return pos1.clone().subtract(pos2).length();
}

// Set text for the Subtitles actor
function setSubtitles(text: string) {
  Sup.getActor("Subtitles").textRenderer.setText(text);
}