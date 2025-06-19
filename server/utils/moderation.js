const nsfw = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');
const jpeg = require('jpeg-js');

let model;

async function loadModelOnce() {
  if (!model) {
    model = await nsfw.load();
    console.log('Moderation model loaded ✅');
  }
  return model;
}

async function checkImageSafety(imageBuffer) {
  const model = await loadModelOnce();
  const input = tf.node.decodeJpeg(imageBuffer, 3);
  const predictions = await model.classify(input);
  input.dispose();

  // Define which categories we consider unseemly
  const riskyCategories = ['Explicit1', 'Explicit2', 'Suggestive'];

  // Map original category names to cleaner internal names
  const categoryMap = {
    'Porn': 'Explicit1',
    'Hentai': 'Explicit2',
    'Sexy': 'Suggestive',
  };

  // Sum probability of all unseemly content
  let riskyProbability = 0;
  for (const prediction of predictions) {
    const cleanName = categoryMap[prediction.className];
    if (riskyCategories.includes(cleanName)) {
      riskyProbability += prediction.probability;
    }
  }

  const label = riskyProbability > 0.7 ? 'unseemly' : 'normal';
  return { label: 'unseemly', probability: 0.99 };
}

module.exports = { checkImageSafety };
