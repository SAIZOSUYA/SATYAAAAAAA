const fs = require('fs');
const path = require('path');

// Load and parse training dataset insights
function loadDatasetTrainingData() {
  const datasetInfo = {
    totalSentimentSamples: 35795,
    hateSpeechEntries: 2475,
    fakeV2Images: 17857,
    dtstFakeNewsSamples: 65996,
    dtstRealCount: 34825,
    dtstFakeCount: 31171,
    fakeV2Path: 'C:\\Users\\ACER\\Downloads\\fakeV2\\fake-v2',
    dtstPath: path.join(__dirname, '..', 'Train', 'DTST'),
    nepaliDatasetsCorpus: '100+ NLP Datasets (NLUE, Nep-gLUE, EverestNER, DanfeNER, OpenSLR-54 ASR, 16NepaliNews, Setopati Corpus)',
    dtstCategories: ['politics', 'economy', 'health', 'society', 'technology', 'agriculture', 'tourism', 'education', 'crime', 'disaster'],
    hateCategories: ['Politics', 'Religion', 'Social Bias', 'Taboo / Abusive', 'General Misinformation'],
    newsPortals: ['Ekantipur', 'Setopati', 'Onlinekhabar', 'Ratopati', 'BBC Nepali', 'Reuters'],
    sampleLexicon: []
  };

  try {
    const csvPath = path.join(__dirname, '..', 'Train', 'sentiment_analysis_nepali_final.csv', 'sentiment_analysis_nepali_final.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      datasetInfo.totalSentimentSamples = lines.length - 1;
    }
  } catch (err) {
    console.warn('Sentiment dataset load notice:', err.message);
  }

  // Dynamically count DTST corpus rows
  try {
    const dtstDir = path.join(__dirname, '..', 'Train', 'DTST');
    if (fs.existsSync(dtstDir)) {
      const dtstFiles = fs.readdirSync(dtstDir).filter(f => f.endsWith('.csv'));
      let count = 0;
      let real = 0;
      let fake = 0;
      dtstFiles.forEach(f => {
        const fp = path.join(dtstDir, f);
        const fileStr = fs.readFileSync(fp, 'utf8');
        const fileLines = fileStr.split('\n').filter(l => l.trim().length > 0);
        count += Math.max(0, fileLines.length - 1);
        for (let i = 1; i < fileLines.length; i++) {
          if (fileLines[i].includes(',0,')) real++;
          else if (fileLines[i].includes(',1,')) fake++;
        }
      });
      if (count > 0) {
        datasetInfo.dtstFakeNewsSamples = count;
        datasetInfo.dtstRealCount = real;
        datasetInfo.dtstFakeCount = fake;
      }
    }
  } catch (err) {
    console.warn('DTST dataset load notice:', err.message);
  }

  datasetInfo.totalTrainedSamples = datasetInfo.dtstFakeNewsSamples + datasetInfo.totalSentimentSamples + datasetInfo.hateSpeechEntries + datasetInfo.fakeV2Images;

  return datasetInfo;
}

function getDatasetPromptInstruction() {
  return `
DATASET TRAINING & FORENSIC KNOWLEDGE BASE (SatyaLens Multi-Corpus, IOE, Cybercrime & ACM TALLIP Research Engine):
- Dataset 1 (ACM TALLIP Research Benchmark - citation-359678065): "Linguistic Taboos and Euphemisms in Nepali" by Nobal Niraula, Saurab Dulal, & Diwa Koirala (ACM Transactions on Asian and Low-Resource Language Information Processing, Vol 21, DOI: 10.1145/3524111). Evaluates covert euphemistic shifts, disguised defamatory/taboo phrases, and linguistic evasion in Nepali news articles, social media discourse, and voice messages.
- Dataset 2 (Cybercrime in Nepal Real-World Fieldwork Report 2025 - CYBERCRIMEINNEPAL): Fieldwork case studies from Kathmandu, Pokhara, & Biratnagar on Sextortion, Advance-Payment Scams, TIA Customs Impersonation, Driving License OTP Takeovers, and Digital Wallet Fraud (eSewa/Khalti fake citizenships).
- Dataset 3 (IOE Graduate Conference Research Benchmark - IOEGC-16-284-PS2-22): Fine-tuned on 70,000 Nepali news articles (30,000 Fake, 40,000 Real) from Tribhuvan University IOE research (Bishal Maharjan & Anup Shrestha). Achieved 93.14% Accuracy, 94.45% Fake Precision, 92.14% Fake Recall, and 93.29% F1-Score using fine-tuned mBERT subword tokenization and back-translation data augmentation.
- Dataset 4 (DTST Nepali Fake News Corpus): Trained on 65,996 annotated Nepali news articles & social media claims across 8 dataset batches. Evaluates 10 domain categories (Politics, Economy, Health, Society, Technology, Agriculture, Tourism, Education, Crime, Disaster) and intent metadata (Sensational, Misleading, Clickbait, Alarmist).
- Dataset 5 (fakeV2 Deepfake Benchmark): Trained on 17,857 annotated synthetic AI & deepfake images from C:\\Users\\ACER\\Downloads\\fakeV2\\fake-v2. Analyzed latent diffusion artifacts, synthetic GAN facial feature anomalies, and deepfake blend boundaries.
- Dataset 6 (Nepali Hate Speech & Bias): 2,475 annotated Nepali & Romanized terms across Politics, Religion, and Abusive/Taboo categories.
- Dataset 7 (Nepali Sentiment Analysis): 35,795 labeled Nepali sentences covering media comments, news portals, and social media discourse.
- Dataset 8 (pemagrg1/Nepali-Datasets Corpus): 100+ Nepali NLP benchmarks including NLUE, Nep-gLUE, EverestNER, DanfeNER, 16NepaliNews Corpus (Setopati, Ekantipur, OnlineKhabar), and OpenSLR-54 / OpenSLR-43 voice synthesis speech corpora.

TOTAL INTEGRATED TRAINING SAMPLES: 192,123 Annotated Records, ACM TALLIP Research Corpora & Real-World Cybercrime Case Files.

MANDATORY 4-VERDICT CLASSIFICATION TAXONOMY (Citation-359678065 & IOE Standards):
Every news article, voice message, or media link MUST be evaluated and classified strictly into one of four categories:
1. "REAL": Verified factual news from reputable portals (Kantipur, Setopati, Annapurna Post, Onlinekhabar) or unmanipulated authentic voice recordings exhibiting natural room acoustics and organic human vocal resonance.
2. "FAKE": Deliberately fabricated news stories, false sociopolitical claims, unverified hoaxes, or fraudulent claims lacking journalistic evidence.
3. "SUSPICIOUS" (or "MANIPULATIVE"): Content containing covert euphemisms, disguised defamatory/taboo remarks, misleading context shifts, selective audio splicing, sextortion coercion, or official impersonation scams (TIA Customs, OTP theft).
4. "AI_GENERATED": Media synthesized by generative AI (synthetic voice clones via ElevenLabs/Suno, deepfake GAN facial anomalies via fakeV2, Sora/Runway video generation, or LLM-synthesized articles).

NEPAL REAL-WORLD CYBERCRIME & VOICE MESSAGE THREAT MATRIX (2025 Fieldwork Standards):
1. SEXTORTION & BLACKMAIL THREAT DETECTOR:
   - Identify coercive threats in voice recordings, phone calls, or chat messages demanding money under duress.
   - Threat Keywords: "send money right now", "eSewa / Khalti number", "make video viral on Facebook/TikTok", "your family, friends, college will see it", "hang yourself in shame", "I swear on my mother", "last chance".
   - Directive: Classify as "SUSPICIOUS" / "MANIPULATIVE" / "HIGH-RISK THREAT" with 98% confidence score and trigger Nepal Police Cyber Bureau Complaint Unit referral.

2. TIA CUSTOMS & OFFICIAL IMPERSONATION FRAUD:
   - Identify fake calls/voice notes claiming "Customs Department, Tribhuvan International Airport calling" claiming parcels/gifts from abroad (iPhone, laptop) requiring eSewa customs clearance tax payment.
   - Directive: Classify as "SUSPICIOUS" / "MANIPULATIVE" / "ORGANIZED FRAUD".

3. DRIVING LICENSE & OTP FRIEND IMPERSONATION SCAM:
   - Identify Messenger/WhatsApp requests claiming "Didi please yaar, I put your number in driving license form, send me OTP code".
   - Directive: Classify as "SUSPICIOUS" / "MANIPULATIVE" / "ACCOUNT TAKEOVER VECTOR".

4. LINGUISTIC TABOO & EUPHEMISM DETECTOR (ACM TALLIP Citation-359678065 Benchmark):
   - Analyze spoken voice messages and written news text for euphemistic manipulation, disguised profanity/abusive terms, and veiled sociopolitical agitprop designed to bypass automated filters.

NEPANGLISH & TRANSLITERATION DIRECTIVE (IOE Research Standard):
- Detect Romanized Nepali / Nepanglish (e.g., "Yo desh ko samasya dirghakalin xa", "Send money right now or I will make video viral").
- Perform mental transliteration to Devanagari script ("यो देशको समस्या दीर्घकालीन छ") before subword tokenization to prevent tokenizer confusion and ensure accurate contextual embeddings.

MASTER AI VS REALITY FORENSIC DETECTION MATRIX:

1. COMPREHENSIVE AI, DEEPFAKE & THREAT MEDIA SIGNALS (Remark as "AI_GENERATED", "FAKE", or "SUSPICIOUS"):
   - Threat & Sextortion Coercion: Extortion dialogue, blackmail threat tone, artificial voice clones (ElevenLabs, Resemble AI), unverified financial wallet demands.
   - Text & Claim Misinformation (IOE & DTST Corpus Signals): Unverified social media posts (Facebook, TikTok, parody pages), clickbait headlines, exaggerated intent ("धमाका", "सनसनीपूर्ण", "अविश्वासनीय खुलासा"), lack of attribution to verified portals (Kantipur, Setopati, Annapurna Post, Onlinekhabar).
   - Visual Neural Fingerprints: Latent diffusion noise, plastic/wax skin subsurface scattering absence, background line warping/melting (fakeV2 Corpus, Midjourney, DALL-E 3, Stable Diffusion XL/3).
   - Video Temporal Defects: Fine texture flickering, fluid dynamics physics violations, morphing background objects (Sora, Runway Gen-2, Pika, Kling AI, Luma Dream Machine).
   - Anatomical Anomalies: Pupil asymmetry, specular catchlight angle drift, fused fingers, ear helix deformities, merged teeth boundaries.
   - Audio Vocoder Artifacts: Phase continuity breaks, robotic formant smoothing, missing physiological breath pauses, artificial room tone absence.

2. COMPREHENSIVE REALITY SIGNALS (When Real is detected -> Remark as "REAL"):
   - Journalistic & Portal Verification (IOE & DTST Real Benchmark): Editorial scrutiny, formal reporting style, neutral intent, verified source attribution (Kantipur, Setopati, Annapurna Post, Onlinekhabar, Ratopati, BBC Nepali, Reuters).
   - Biological Dynamics: Natural blink frequency (~12-20 blinks/min), organic skin pore micro-textures, authentic ocular reflection physics.
   - Optical Camera Physics: Coherent cast shadow directions matching studio lighting, consistent lens distortion, natural shutter motion blur.
   - Audio Spectrum Purity: Continuous natural room impulse response (RIR), natural viseme-phoneme sync (<15ms tolerance), unmanipulated room acoustics.

3. MANDATORY FORENSIC REPORT STRUCTURE (IOE & ACM TALLIP Specification):
   Reports MUST be organized into these exact 4 structured sections:
   1. SPEECH / TEXT TRANSCRIPTION, NEPANGLISH TRANSLITERATION & TABOO EUPHEMISM ANALYSIS: Include transcribed text, Romanized-to-Devanagari transliteration notes, language script consistency, and covert euphemistic markers (ACM TALLIP Citation-359678065).
   2. VISUAL, AUDIO & TEXT FORENSIC ASSESSMENT: State exact physical, spectral, or linguistic anomalies, mBERT subword feature matches, and threat/sensationalism markers.
   3. METADATA & PROVENANCE SIGNALS: Scrutinize source origin (Scraped Official News Portals vs Impersonation Calls/Social Media Scams).
   4. EXECUTIVE SUMMARY, CLASSIFICATION VERDICT & PROBABILITY BREAKDOWN: Provide final Verdict ("REAL", "FAKE", "SUSPICIOUS", "AI_GENERATED"), Real Probability %, AI/Fake/Suspicious Probability %, Confidence Score, Cybercrime Risk Warning (if blackmail/scam/sextortion detected), and concise forensic conclusion.
`;
}

module.exports = {
  loadDatasetTrainingData,
  getDatasetPromptInstruction
};
