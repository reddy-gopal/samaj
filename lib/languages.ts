import { DocumentType, ImmediateAction, SupportedLanguage } from "./schema";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    script: "Telugu",
    speechLocale: "te-IN",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    script: "Devanagari",
    speechLocale: "hi-IN",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    script: "Latin",
    speechLocale: "en-IN",
  },
];

export interface UiTranslations {
  appName: string;
  appSubtitle: string;
  heroTagline: string;
  navHome: string;
  navScan: string;
  navMyLetters: string;
  navSafety: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  cameraButton: string;
  uploadButton: string;
  sampleButton: string;
  dragDropText: string;
  selectLanguage: string;
  privacyNote: string;
  analyzingTitle: string;
  analyzingSubtitle: string;
  resultHeadingNotice: string;
  resultHeadingAction: string;
  detailsHeading: string;
  deadlineLabel: string;
  amountLabel: string;
  issuerLabel: string;
  referenceLabel: string;
  noDeadline: string;
  noAmount: string;
  scamAlertTitle: string;
  scamWarningSubtitle: string;
  scamShieldPoints: {
    noOtp: string;
    noPersonalUpi: string;
    verifyOfficial: string;
    cannotConfirmGenuine: string;
  };
  fallbackNotice: string;
  fallbackSubtext: string;
  listenButton: string;
  stopListeningButton: string;
  ttsHeading: string;
  ttsSubtext: string;
  ttsPlay: string;
  ttsStop: string;
  ttsSpeedNormal: string;
  ttsSpeedSlow: string;
  ttsNowSpeaking: string;
  ttsReadyStatus: string;
  shareWhatsAppButton: string;
  retakeButton: string;
  anotherNoticeButton: string;
  sampleNoticesTitle: string;
  sampleNoticesSubtitle: string;
  safetySectionTitle: string;
  safetySectionSub: string;
  recentAnalysisTitle: string;
  clearHistory: string;
  emptyHistoryTitle: string;
  emptyHistorySub: string;
  analyzeFirstLetter: string;
  highRiskBadge: string;
  warningRiskBadge: string;
  safeBadge: string;
  features: {
    letterType: string;
    letterTypeDesc: string;
    checkSafety: string;
    checkSafetyDesc: string;
    simpleSummary: string;
    simpleSummaryDesc: string;
    nextSteps: string;
    nextStepsDesc: string;
  };
  documentTypes: Record<DocumentType, string>;
  actionLabels: Record<ImmediateAction, string>;
  errorUploadTooBig: string;
  errorGeneric: string;
  viewDetails: string;
  hideDetails: string;
  disclaimerPrefix: string;
  notDocumentTitle: string;
  notDocumentMessage: string;
  notSpecified: string;
  purposeUnclear: string;
  tipsTitle: string;
  tipsFlat: string;
  tipsLight: string;
  tipsEdges: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, UiTranslations> = {
  te: {
    appName: "సమాజ్ (Samaj)",
    appSubtitle: "అధికారిక నోటీసులను సులభంగా మరియు సురక్షితంగా అర్థం చేసుకోండి",
    heroTagline: "విద్యుత్ బిల్లులు, బ్యాంక్ నోటీసులు, లేదా కోర్టు పత్రాల ఫోటో తీయండి - సరళమైన తెలుగులో అర్థం తెలుసుకోండి.",
    navHome: "హోమ్",
    navScan: "స్కాన్ చేయండి",
    navMyLetters: "నా నోటీసులు",
    navSafety: "భద్రతా సూచనలు",
    heroTitle: "ఏ అధికారిక లేఖనైనా సులభంగా అర్థం చేసుకోండి",
    heroSubtitle: "సరళమైనది. సురక్షితమైనది. మీ మాతృభాషలో.",
    heroDescription: "విద్యుత్ బిల్లు, బ్యాంక్ KYC, పన్ను డిమాండ్ లేదా కోర్టు సమన్ల ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి. సరళమైన తెలుగు, హిందీ లేదా ఇంగ్లీషులో స్పష్టమైన వివరణ పొందండి.",
    cameraButton: "నోటీస్ ఫోటో తీయండి",
    uploadButton: "గ్యాలరీ నుండి ఎంచుకోండి",
    sampleButton: "నమూనా నోటీస్ ప్రయత్నించండి",
    dragDropText: "ఫోటోను ఇక్కడ వేయండి లేదా క్లిక్ చేయండి",
    selectLanguage: "మీ భాషను ఎంచుకోండి",
    privacyNote: "మీ ఫోటో నోటీసును అర్థం చేసుకోవడానికి మాత్రమే విశ్లేషించబడుతుంది. ఇది శాశ్వతంగా నిల్వ చేయబడదు.",
    analyzingTitle: "నోటీసును చదువుతున్నాము...",
    analyzingSubtitle: "ముఖ్యమైన వివరాలు, గడువు మరియు భద్రతను తనిఖీ చేస్తున్నాము",
    resultHeadingNotice: "ఈ నోటీసు ఏమిటి?",
    resultHeadingAction: "నేను వెంటనే ఏమి చేయాలి?",
    detailsHeading: "గుర్తించిన పూర్తి వివరాలు",
    deadlineLabel: "గడువు తేదీ (Deadline)",
    amountLabel: "చెల్లించాల్సిన మొత్తం (Amount Due)",
    issuerLabel: "జారీ చేసిన సంస్థ (Issuer)",
    referenceLabel: "రిఫరెన్స్ / ఖాతా సంఖ్య",
    noDeadline: "నోటీసులో స్పష్టమైన గడువు పేర్కొనబడలేదు",
    noAmount: "నోటీసులో నిర్దిష్ట మొత్తం పేర్కొనబడలేదు",
    scamAlertTitle: "మోసం / స్కామ్ హెచ్చరిక (Scam Red Flag)",
    scamWarningSubtitle: "ఈ నోటీసులో అనుమానాస్పద అంశాలు గమనించబడ్డాయి. జాగ్రత్త వహించండి!",
    scamShieldPoints: {
      noOtp: "ఎవరితోనూ మీ OTP, పిన్, పాస్‌వర్డ్ లేదా CVV పంచుకోవద్దు.",
      noPersonalUpi: "వ్యక్తిగత UPI IDలకు లేదా తెలియని ఖాతాలకు డబ్బు పంపవద్దు.",
      verifyOfficial: "అధికారిక వెబ్‌సైట్ లేదా మీ పాత బిల్లులోని నంబర్‌తో మాత్రమే సంస్థను సంప్రదించి ధృవీకరించుకోండి.",
      cannotConfirmGenuine: "ఈ సమాజ్ యాప్ నోటీసు నిజమైనదా కాదా అనేది 100% నిర్ధారించలేదు. అనుమానం ఉంటే ఎల్లప్పుడూ అధికారిక కార్యాలయాన్ని కలవండి.",
    },
    fallbackNotice: "ఈ నోటీసు గురించి నాకు ఖచ్చితంగా తెలియదు. దయచేసి మీరు విశ్వసించే వారిని అడగండి లేదా అధికారిక సంస్థను నేరుగా సంప్రదించండి.",
    fallbackSubtext: "ఫోటో అస్పష్టంగా ఉండవచ్చు లేదా వివరాలు అసంపూర్ణంగా ఉండవచ్చు.",
    listenButton: "చదివి వినిపించండి (Listen)",
    stopListeningButton: "ఆపండి (Stop)",
    ttsHeading: "వాయిస్ వివరణ & ఆడియో సారాంశం (Voice Reader)",
    ttsSubtext: "నోటీసు సారాంశాన్ని స్పష్టమైన తెలుగులో వినండి",
    ttsPlay: "చదివి వినిపించండి (Play Audio)",
    ttsStop: "ఆపండి (Stop)",
    ttsSpeedNormal: "సాధారణం (1.0x)",
    ttsSpeedSlow: "నెమ్మదిగా (0.85x)",
    ttsNowSpeaking: "తెలుగులో చదివి వినిపిస్తున్నాము...",
    ttsReadyStatus: "సారాంశాన్ని బిగ్గరగా వినడానికి ప్లే చేయండి",
    shareWhatsAppButton: "WhatsApp లో షేర్ చేయండి",
    retakeButton: "మళ్లీ ఫోటో తీయండి",
    anotherNoticeButton: "మరొక నోటీసును పరిశీలించండి",
    sampleNoticesTitle: "పరీక్షించడానికి నమూనా నోటీసులు",
    sampleNoticesSubtitle: "విద్యుత్, బ్యాంక్, పన్ను, కోర్టు నమూనాలను ఒక్క క్లిక్‌తో పరీక్షించండి",
    safetySectionTitle: "అధికారిక భద్రత & స్కామ్ రక్షణ మార్గదర్శి",
    safetySectionSub: "నకిలీ కనెక్షన్ కట్ హెచ్చరికలు, అనధికార UPI డిమాండ్లు మరియు సైబర్ మోసాల నుండి మిమ్మల్ని రక్షించుకోండి",
    recentAnalysisTitle: "ఇటీవలి విశ్లేషణలు",
    clearHistory: "చరిత్రను తొలగించు",
    emptyHistoryTitle: "ఇంకా లేఖలు విశ్లేషించబడలేదు",
    emptyHistorySub: "మీ నిజమైన లేఖను పైన స్కాన్ చేయండి లేదా నమూనా నోటీసును ప్రయత్నించండి.",
    analyzeFirstLetter: "మొదటి నోటీసును విశ్లేషించండి",
    highRiskBadge: "తీవ్రమైన ప్రమాదం (High Scam Risk)",
    warningRiskBadge: "అనుమానాస్పదం (Warning)",
    safeBadge: "సాధారణ నోటీసు (No Scam Signs)",
    features: {
      letterType: "నోటీసు రకాన్ని గుర్తించండి",
      letterTypeDesc: "బ్యాంక్, ప్రభుత్వం, విద్యుత్, కోర్టు తదితరాలు.",
      checkSafety: "భద్రతను తనిఖీ చేయండి",
      checkSafetyDesc: "ఇది అసలైనదా లేక నకిలీ స్కామా అని తెలుసుకోండి.",
      simpleSummary: "సరళమైన సారాంశం",
      simpleSummaryDesc: "సులభమైన తెలుగు, హిందీ లేదా ఇంగ్లీషులో.",
      nextSteps: "తదుపరి ఏమి చేయాలో చూడండి",
      nextStepsDesc: "స్పష్టమైన సూచనలు మరియు మార్గదర్శకత్వం.",
    },
    documentTypes: {
      electricity: "విద్యుత్ శాఖ నోటీసు",
      bank: "బ్యాంక్ / KYC నోటీసు",
      court: "కోర్టు సమన్లు / న్యాయ పత్రం",
      tax: "ఆదాయ పన్ను / జీఎస్టీ డిమాండ్",
      insurance: "బీమా పాలసీ నోటీసు",
      government: "ప్రభుత్వ అధికారిక నోటీసు",
      unknown: "గుర్తించబడని పత్రం",
    },
    actionLabels: {
      pay_online: "అధికారిక పోర్టల్‌లో ఆన్‌లైన్ చెల్లింపు చేయండి",
      visit_branch: "సమీపంలోని అధికారిక శాఖ లేదా కార్యాలయాన్ని సందర్శించండి",
      contact_issuer: "అధికారిక హెల్ప్‌లైన్ నంబర్‌కు నేరుగా కాల్ చేయండి",
      submit_document: "అడిగిన పత్రాలను అధికారిక కార్యాలయంలో సమర్పించండి",
      ignore: "దీనిపై ప్రస్తుతానికి ఎటువంటి చర్య అవసరం లేదు",
      ask_trusted_person: "మీరు నమ్మే వ్యక్తి లేదా న్యాయవాది సహాయం తీసుకోండి",
      unclear: "స్పష్టంగా లేదు - అధికారిక సంస్థను సంప్రదించండి",
    },
    errorUploadTooBig: "చిత్రం పరిమాణం చాలా పెద్దదిగా ఉంది (8MB కంటే తక్కువ ఉండాలి).",
    errorGeneric: "నోటీసును చదవడంలో సమస్య ఎదురైంది. దయచేసి స్పష్టమైన ఫోటోతో మళ్లీ ప్రయత్నించండి.",
    viewDetails: "మరిన్ని వివరాలు చూడండి",
    hideDetails: "వివరాలను దాచండి",
    disclaimerPrefix: "ముఖ్య గమనిక: ఇది న్యాయ సలహా కాదు. చర్య తీసుకునే ముందు అధికారిక జారీకర్తతో ధృవీకరించుకోండి.",
    notDocumentTitle: "అధికారిక పత్రం లేదా నోటీసు కనిపించలేదు",
    notDocumentMessage: "ఈ ఫోటోలో ఎటువంటి అధికారిక లేఖ, బిల్లు లేదా నోటీసు కనిపించలేదు. ఇది నేల, వస్తువు లేదా ఇతర దృశ్యంగా కనిపిస్తోంది.",
    notSpecified: "నోటీసులో పేర్కొనబడలేదు",
    purposeUnclear: "చిత్రం నుండి స్పష్టంగా లేదు",
    tipsTitle: "స్పష్టమైన ఫోటో తీయడానికి చిట్కాలు",
    tipsFlat: "మీ కాగితపు నోటీసును బల్ల లేదా ఫ్లాట్ ఉపరితలంపై నిటారుగా ఉంచండి",
    tipsLight: "మంచి వెలుతురు ఉండేలా చూసుకోండి మరియు నీడలను నివారించండి",
    tipsEdges: "నోటీసు నాలుగు అంచులు మరియు అక్షరాలు స్పష్టంగా కెమెరాలో కనిపించాలి",
  },
  hi: {
    appName: "समाज (Samaj)",
    appSubtitle: "सरकारी और आधिकारिक नोटिस को आसानी से और सुरक्षित समझें",
    heroTagline: "बिजली बिल, बैंक केवाईसी, या कोर्ट नोटिस की तस्वीर लें - सरल हिंदी में तुरंत समझें।",
    navHome: "होम",
    navScan: "स्कैन करें",
    navMyLetters: "मेरे पत्र",
    navSafety: "सुरक्षा टिप्स",
    heroTitle: "किसी भी आधिकारिक पत्र को आसानी से समझें",
    heroSubtitle: "सरल। सुरक्षित। आपकी अपनी भाषा में।",
    heroDescription: "बिजली बिल, बैंक केवाईसी, इनकम टैक्स या कोर्ट सम्मन की फोटो खींचें या अपलोड करें। सरल हिंदी, तेलुगु या अंग्रेजी में तुरंत स्पष्ट सारांश पाएं।",
    cameraButton: "नोटिस की फोटो लें",
    uploadButton: "गैलरी से फोटो चुनें",
    sampleButton: "सैंपल नोटिस से आज़माएं",
    dragDropText: "फोटो यहाँ खींचें या क्लिक करें",
    selectLanguage: "अपनी भाषा चुनें",
    privacyNote: "आपकी फोटो केवल नोटिस समझाने के लिए प्रोसेस की जाती है और इसे स्थायी रूप से सेव नहीं किया जाता है।",
    analyzingTitle: "नोटिस को पढ़ रहे हैं...",
    analyzingSubtitle: "जरूरी विवरण, अंतिम तारीख और सुरक्षा की जांच हो रही है",
    resultHeadingNotice: "यह नोटिस किस बारे में है?",
    resultHeadingAction: "मुझे तुरंत क्या करना चाहिए?",
    detailsHeading: "पहचाने गए पूर्ण विवरण",
    deadlineLabel: "अंतिम तिथि (Deadline)",
    amountLabel: "देय राशि (Amount Due)",
    issuerLabel: "जारीकर्ता संस्था (Issuer)",
    referenceLabel: "संदर्भ / खाता संख्या (Reference ID)",
    noDeadline: "नोटिस में कोई स्पष्ट अंतिम तिथि नहीं दी गई है",
    noAmount: "नोटिस में कोई निश्चित राशि नहीं लिखी है",
    scamAlertTitle: "धोखाधड़ी / स्कैम चेतावनी (Scam Warning)",
    scamWarningSubtitle: "इस नोटिस में संदिग्ध संकेत मिले हैं। कृपया सावधान रहें!",
    scamShieldPoints: {
      noOtp: "कभी भी अपना OTP, PIN, पासवर्ड या CVV किसी से साझा न करें।",
      noPersonalUpi: "किसी भी व्यक्तिगत UPI ID या अनजान बैंक खाते में पैसे न भेजें।",
      verifyOfficial: "जारीकर्ता की आधिकारिक वेबसाइट या पुराने आधिकारिक बिल पर दिए नंबर से ही पुष्टि करें।",
      cannotConfirmGenuine: "यह समाज ऐप नोटिस के 100% असली होने की पुष्टि नहीं कर सकता। संदेह होने पर हमेशा आधिकारिक कार्यालय से संपर्क करें।",
    },
    fallbackNotice: "मुझे इस नोटिस के बारे में पूरा यकीन नहीं है। कृपया किसी भरोसेमंद व्यक्ति से पूछें या सीधे आधिकारिक जारीकर्ता से संपर्क करें।",
    fallbackSubtext: "हो सकता है कि फोटो धुंधली हो या विवरण कटे हुए हों।",
    listenButton: "सुनें (Listen)",
    stopListeningButton: "रोकें (Stop)",
    ttsHeading: "आवाज़ में सारांश सुनें (Voice Narrator)",
    ttsSubtext: "नोटिस का सरल सारांश स्पष्ट आवाज़ में सुनें",
    ttsPlay: "बोलकर सुनाएं (Play Audio)",
    ttsStop: "रोकें (Stop)",
    ttsSpeedNormal: "सामान्य (1.0x)",
    ttsSpeedSlow: "धीमा (0.85x)",
    ttsNowSpeaking: "हिंदी में बोला जा रहा है...",
    ttsReadyStatus: "सारांश सुनने के लिए प्ले बटन दबाएं",
    shareWhatsAppButton: "WhatsApp पर शेयर करें",
    retakeButton: "फिर से फोटो लें",
    anotherNoticeButton: "दूसरा नोटिस जांचें",
    sampleNoticesTitle: "परीक्षण के लिए नमूना नोटिस",
    sampleNoticesSubtitle: "बिजली, बैंक, टैक्स और कोर्ट नोटिस के नमूने एक क्लिक में परखें",
    safetySectionTitle: "आधिकारिक सुरक्षा और धोखाधड़ी से बचाव गाइड",
    safetySectionSub: "बिजली काटने की फर्जी धमकियों, व्यक्तिगत UPI मांगों और साइबर ठगी से सुरक्षित रहें",
    recentAnalysisTitle: "हाल ही के विश्लेषण",
    clearHistory: "इतिहास मिटाएं",
    emptyHistoryTitle: "अभी तक कोई पत्र स्कैन नहीं किया गया",
    emptyHistorySub: "ऊपर अपना वास्तविक पत्र स्कैन करें या नीचे दिए गए सैंपल नोटिस आज़माएं।",
    analyzeFirstLetter: "अपना पहला पत्र स्कैन करें",
    highRiskBadge: "गंभीर खतरा (High Scam Risk)",
    warningRiskBadge: "संदिग्ध (Warning)",
    safeBadge: "सामान्य नोटिस (No Scam Signs)",
    features: {
      letterType: "पत्र का प्रकार पहचानें",
      letterTypeDesc: "बैंक, सरकारी, बिजली, बीमा, कोर्ट आदि।",
      checkSafety: "सुरक्षा जांचें",
      checkSafetyDesc: "जानें कि यह असली है या कोई संदिग्ध धोखाधड़ी।",
      simpleSummary: "सरल सारांश",
      simpleSummaryDesc: "आसान हिंदी, तेलुगु या अंग्रेजी भाषा में।",
      nextSteps: "आगे क्या करना है",
      nextStepsDesc: "स्पष्ट, चरणबद्ध मार्गदर्शन और सहायता।",
    },
    documentTypes: {
      electricity: "बिजली विभाग नोटिस",
      bank: "बैंक / केवाईसी नोटिस",
      court: "अदालती सम्मन / कानूनी नोटिस",
      tax: "इनकम टैक्स / जीएसटी मांग",
      insurance: "बीमा पॉलिसी नोटिस",
      government: "सरकारी आधिकारिक नोटिस",
      unknown: "अज्ञात दस्तावेज",
    },
    actionLabels: {
      pay_online: "आधिकारिक पोर्टल पर ऑनलाइन भुगतान करें",
      visit_branch: "निकटतम आधिकारिक शाखा या कार्यालय जाएं",
      contact_issuer: "आधिकारिक हेल्पलाइन नंबर पर सीधे संपर्क करें",
      submit_document: "मांगे गए दस्तावेज आधिकारिक दफ्तर में जमा करें",
      ignore: "इस पर फिलहाल कोई कार्रवाई आवश्यक नहीं है",
      ask_trusted_person: "किसी भरोसेमंद व्यक्ति या जानकार से सलाह लें",
      unclear: "स्पष्ट नहीं है - आधिकारिक संस्था से संपर्क करें",
    },
    errorUploadTooBig: "छवि का आकार बहुत बड़ा है (8MB से कम होना चाहिए)।",
    errorGeneric: "नोटिस पढ़ने में समस्या आई। कृपया स्पष्ट फोटो के साथ पुनः प्रयास करें।",
    viewDetails: "अधिक विवरण देखें",
    hideDetails: "विवरण छिपाएं",
    disclaimerPrefix: "महत्वपूर्ण: यह कानूनी सलाह नहीं है। कोई भी कदम उठाने से पहले आधिकारिक जारीकर्ता से पुष्टि करें।",
    notDocumentTitle: "कोई आधिकारिक पत्र या नोटिस नहीं मिला",
    notDocumentMessage: "इस फोटो में कोई आधिकारिक नोटिस, बिल या कानूनी पत्र नहीं दिख रहा है। यह किसी वस्तु, फर्श या अन्य दृश्य की फोटो लग रही है।",
    notSpecified: "दस्तावेज में उल्लिखित नहीं है",
    purposeUnclear: "फोटो से स्पष्ट नहीं है",
    tipsTitle: "स्पष्ट फोटो लेने के लिए सुझाव",
    tipsFlat: "अपने नोटिस को टेबल या समतल जगह पर सीधा रखें",
    tipsLight: "अच्छी रोशनी में फोटो लें और परछाई या चमक से बचें",
    tipsEdges: "नोटिस के चारों कोने और लिखावट फ्रेम में पूरी तरह आनी चाहिए",
  },
  en: {
    appName: "Samaj",
    appSubtitle: "Understand official notices safely & immediately",
    heroTagline: "Photograph any electricity bill, bank notice, or court summons to get clear, plain-language triage.",
    navHome: "Home",
    navScan: "Scan Notice",
    navMyLetters: "My Letters",
    navSafety: "Safety Tips",
    heroTitle: "Understand Any Official Letter",
    heroSubtitle: "Simple. Safe. In Your Language.",
    heroDescription: "Upload or photograph any electricity bill, bank notice, court summons, or tax demand. Get clear, plain-language triage in Telugu, Hindi, or English.",
    cameraButton: "Take photo of notice",
    uploadButton: "Upload Letter",
    sampleButton: "Try a sample notice",
    dragDropText: "Drop photo here or click to browse",
    selectLanguage: "Select language",
    privacyNote: "Your photo is processed to explain the notice and is not saved permanently on servers.",
    analyzingTitle: "Analyzing your notice...",
    analyzingSubtitle: "Detecting visible details, deadlines, and scam indicators",
    resultHeadingNotice: "What is this notice?",
    resultHeadingAction: "What should I do?",
    detailsHeading: "Extracted Notice Details",
    deadlineLabel: "Deadline",
    amountLabel: "Amount Due",
    issuerLabel: "Issuer / Authority",
    referenceLabel: "Reference / Account ID",
    noDeadline: "No visible deadline in notice",
    noAmount: "No visible amount due in notice",
    scamAlertTitle: "Scam Warning Alert",
    scamWarningSubtitle: "Suspicious flags were detected in this notice. Please stay vigilant!",
    scamShieldPoints: {
      noOtp: "Never share your OTP, PIN, password, or CVV with anyone.",
      noPersonalUpi: "Do not pay to personal UPI IDs or unverified bank accounts.",
      verifyOfficial: "Verify by contacting the official issuer using the number on its official website or a previous official bill.",
      cannotConfirmGenuine: "This Samaj app cannot confirm whether a notice is 100% genuine. Always contact the official issuer if in doubt.",
    },
    fallbackNotice: "I’m not sure about this notice. Please ask someone you trust or contact the official issuer directly.",
    fallbackSubtext: "The photo may be blurry, cropped, or handwriting is unclear.",
    listenButton: "Listen Aloud",
    stopListeningButton: "Stop Audio",
    ttsHeading: "Voice Narration & Audio Summary",
    ttsSubtext: "Listen to the simplified summary out loud in clear speech",
    ttsPlay: "Listen Aloud (Play Audio)",
    ttsStop: "Stop Audio",
    ttsSpeedNormal: "1.0x Normal",
    ttsSpeedSlow: "0.85x Gentle",
    ttsNowSpeaking: "Speaking summary out loud...",
    ttsReadyStatus: "Tap play to listen to plain-language audio narration",
    shareWhatsAppButton: "Share on WhatsApp",
    retakeButton: "Retake Photo",
    anotherNoticeButton: "Check another notice",
    sampleNoticesTitle: "Try Sample Notices",
    sampleNoticesSubtitle: "Test electricity, banking, tax, and court samples in 1-click",
    safetySectionTitle: "Official Safety & Scam Shield Guide",
    safetySectionSub: "Protect yourself against fake disconnections, fraudulent UPI demands, and impersonation scams",
    recentAnalysisTitle: "Recent Analysis",
    clearHistory: "Clear History",
    emptyHistoryTitle: "No Letters Analyzed Yet",
    emptyHistorySub: "Photograph or upload an official notice above, or pick a sample notice.",
    analyzeFirstLetter: "Analyze Your First Letter",
    highRiskBadge: "High Scam Risk",
    warningRiskBadge: "Warning / Suspicious",
    safeBadge: "No Scam Signs Detected",
    features: {
      letterType: "Identify Letter Type",
      letterTypeDesc: "Bank, government, electricity, court, tax, etc.",
      checkSafety: "Check Safety & Authenticity",
      checkSafetyDesc: "Know if it looks genuine or has scam red flags.",
      simpleSummary: "Get Simple Summary",
      simpleSummaryDesc: "In plain Telugu, Hindi, or English.",
      nextSteps: "See What to Do Next",
      nextStepsDesc: "Clear step-by-step guidance without confusion.",
    },
    documentTypes: {
      electricity: "Electricity Department Notice",
      bank: "Bank / KYC Notice",
      court: "Court Summons / Legal Document",
      tax: "Tax Demand Notice (IT / GST)",
      insurance: "Insurance Policy Notice",
      government: "Government / Municipal Notice",
      unknown: "Uncategorized Document",
    },
    actionLabels: {
      pay_online: "Pay online via the official portal only",
      visit_branch: "Visit the official branch or municipal office in person",
      contact_issuer: "Call the verified official helpline number",
      submit_document: "Submit required documents at the official office",
      ignore: "No immediate action required right now",
      ask_trusted_person: "Show this to a trusted family member or legal advisor",
      unclear: "Unclear — Please contact the official issuer directly",
    },
    errorUploadTooBig: "Image size is too large (must be under 8MB).",
    errorGeneric: "Failed to analyze notice. Please try again with a clearer photo.",
    viewDetails: "View full extracted details",
    hideDetails: "Hide details",
    disclaimerPrefix: "Notice: This is not legal advice. Verify with the official issuer before acting.",
    notDocumentTitle: "No Official Notice Detected",
    notDocumentMessage: "This photo does not appear to contain an official notice, bill, or legal document. It seems to show an unrelated surface, object, or outdoor scene.",
    notSpecified: "Not specified in document",
    purposeUnclear: "Unclear from current photo",
    tipsTitle: "Tips for a clear capture",
    tipsFlat: "Place your paper notice flat on a table or plain surface",
    tipsLight: "Ensure bright lighting and avoid harsh shadows or flash glares",
    tipsEdges: "Keep all four corners and printed text clearly within the camera frame",
  },
};
