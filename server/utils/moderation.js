// utils/moderation.js
const axios = require('axios');

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/unitary/toxic-bert';

// قائمة كلمات سيئة (يمكنك التعديل والإضافة)
const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'nigger', 'faggot', 'cunt',
  'whore', 'slut', 'damn', 'لعنة', 'قحبة', 'زانية', 'شرموطة', 'كلب', 'حمار', 'زب', 'كس', 'طيز',
  'عرص', 'متناك', 'منيوك', 'قواد', 'لوطي', 'شاذ', 'gay', 'suck', 'rape', 'اغتصاب', 'متحول', 'sex', 'porn', 'xxx', 'نيك', 'fuck you', 'motherfucker', 'son of a bitch',
  // كلمات عربية دارجة
  'حقير', 'مقرف', 'وسخ', 'نجس', 'تافه', 'سافل', 'وضيع', 'سخيف', 'مريض', 'مقزز', 'قذر', 'مخزي', 'مخجل', 'مخنث', 'مخرب', 'مجرم', 'محتال', 'منافق', 'كذاب', 'كريه', 'مزعج', 'مغفل', 'غبي', 'أبله', 'أحمق', 'معتوه', 'مجنون', 'مريض نفسي', 'مريض عقلي', 'مريض جنسياً', 'مريض أخلاقياً', 'مريض اجتماعياً', 'مريض دينياً', 'مريض فكرياً', 'مريض سياسياً', 'مريض اقتصادياً', 'مريض علمياً', 'مريض ثقافياً', 'مريض تربوياً', 'مريض تعليمياً', 'مريض بدنياً', 'مريض جسدياً', 'مريض عقلياً', 'مريض نفسياً', 'مريض أخلاقياً', 'مريض اجتماعياً', 'مريض دينياً', 'مريض فكرياً', 'مريض سياسياً', 'مريض اقتصادياً', 'مريض علمياً', 'مريض ثقافياً', 'مريض تربوياً', 'مريض تعليمياً', 'مريض بدنياً', 'مريض جسدياً'
];

function containsBadWord(text) {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .replace(/[\s\-_.،؛:!؟?~`'"\[\](){}<>|\\/\\\\]/g, ''); 
  return BAD_WORDS.some(bad => {
    const badNorm = bad.toLowerCase().replace(/[\s\-_.،؛:!؟?~`'"\[\](){}<>|\\/\\\\]/g, '');
    return normalized.includes(badNorm);
  });
}

async function moderateText(text) {
  // فلترة الكلمات السيئة يدويًا أولاً
  if (containsBadWord(text)) {
    return {
      flagged: true,
      reason: 'bad_word',
      details: 'تم اكتشاف كلمة غير لائقة في النص مباشرة.'
    };
  }
  if (!HF_API_KEY) throw new Error('HF_API_KEY not set');

  const response = await axios.post(
    HF_MODEL_URL,
    { inputs: text },
    {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    }
  );

  
  const result = response.data[0];

  const toxicLabel = result.find(l => l.label.toLowerCase() === 'toxic');
  const toxicScore = toxicLabel ? toxicLabel.score : 0;

  
  return {
    flagged: toxicScore > 0.5,
    toxicScore,
    details: result
  };
}

module.exports = { moderateText };
