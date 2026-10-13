/**
 * JanSamadhan — Translation Dictionary
 *
 * Rules followed:
 * - Names of people, organisations, universities, locations, technical terms
 *   and brand names are NOT translated.
 * - Simple Hindi that works for both urban and rural users.
 * - Formatting/placeholders preserved exactly.
 */

export type Lang = "en" | "hi";

export const translations = {
  // ── Navbar ────────────────────────────────────────────────────────────────
  nav_problems: { en: "Problems", hi: "समस्याएँ" },
  nav_solutions: { en: "Solutions", hi: "समाधान" },
  nav_partnerships: { en: "Partnerships", hi: "साझेदारियाँ" },
  nav_home: { en: "Home", hi: "होम" },
  nav_report_problem: { en: "Report Problem", hi: "समस्या दर्ज करें" },
  nav_my_reports: { en: "My Reports", hi: "मेरी रिपोर्ट" },
  nav_my_solutions: { en: "My Solutions", hi: "मेरे समाधान" },
  nav_my_partnerships: { en: "My Partnerships", hi: "मेरी साझेदारियाँ" },
  nav_dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  nav_login: { en: "Log in", hi: "लॉग इन करें" },
  nav_get_started: { en: "Get Started", hi: "शुरू करें" },
  nav_logout: { en: "Log out", hi: "लॉग आउट" },
  nav_signed_in_as: { en: "Signed in as", hi: "लॉग इन हैं" },
  nav_create_account: { en: "Create an Account", hi: "खाता बनाएं" },
  nav_civic_network: { en: "Civic Solution Network", hi: "नागरिक समाधान नेटवर्क" },

  // ── Role labels ───────────────────────────────────────────────────────────
  role_citizen: { en: "Citizen", hi: "नागरिक" },
  role_university: { en: "University", hi: "विश्वविद्यालय" },
  role_industry: { en: "Industry", hi: "उद्योग" },
  role_admin: { en: "Admin", hi: "व्यवस्थापक" },

  // ── Homepage — Hero ───────────────────────────────────────────────────────
  hero_badge: {
    en: "Civic Problem Solving & Academic Innovation Platform",
    hi: "नागरिक समस्या समाधान और शैक्षणिक नवाचार मंच",
  },
  hero_heading: {
    en: "Connecting Citizens, Universities & Industry to Solve Local Challenges",
    hi: "नागरिकों, विश्वविद्यालयों और उद्योगों को स्थानीय समस्याओं के समाधान के लिए जोड़ना",
  },
  hero_subtext: {
    en: "Report real-world community problems, collaborate with academic researchers on technical solutions, and partner with industry leaders for sustainable impact.",
    hi: "सामुदायिक समस्याओं की रिपोर्ट करें, शोधकर्ताओं के साथ मिलकर तकनीकी समाधान खोजें और टिकाऊ प्रभाव के लिए उद्योग जगत से साझेदारी करें।",
  },
  hero_cta_primary: { en: "Get Started Free", hi: "मुफ़्त शुरू करें" },
  hero_cta_login: { en: "Log In", hi: "लॉग इन करें" },
  hero_cta_dashboard: { en: "Go to My Dashboard", hi: "मेरा डैशबोर्ड खोलें" },

  // ── Homepage — Metrics ────────────────────────────────────────────────────
  metric_problems: { en: "Civic Problems Reported", hi: "दर्ज की गई नागरिक समस्याएँ" },
  metric_solutions: { en: "Academic Solutions Proposed", hi: "प्रस्तावित शैक्षणिक समाधान" },
  metric_partnerships: { en: "Industry Partnerships Formed", hi: "बनी हुई उद्योग साझेदारियाँ" },

  // ── Homepage — Search & Filter ────────────────────────────────────────────
  search_placeholder: {
    en: "Search across civic issues, university solutions, or corporate partnerships...",
    hi: "नागरिक मुद्दे, विश्वविद्यालय समाधान या कॉर्पोरेट साझेदारियाँ खोजें...",
  },
  search_btn: { en: "Search", hi: "खोजें" },
  filter_label: { en: "Filter by category", hi: "श्रेणी के अनुसार फ़िल्टर करें" },
  filter_all: { en: "All Categories", hi: "सभी श्रेणियाँ" },

  // ── Homepage — Tabs ───────────────────────────────────────────────────────
  tab_problems: { en: "Civic Problems", hi: "नागरिक समस्याएँ" },
  tab_solutions: { en: "Academic Solutions", hi: "शैक्षणिक समाधान" },
  tab_partnerships: { en: "Industry Partnerships", hi: "उद्योग साझेदारियाँ" },

  // ── Homepage — Empty states ───────────────────────────────────────────────
  empty_problems_title: { en: "No civic problems found", hi: "कोई नागरिक समस्या नहीं मिली" },
  empty_problems_sub: {
    en: "Try adjusting your search query or selecting a different category from above.",
    hi: "अपनी खोज बदलें या ऊपर से कोई अन्य श्रेणी चुनें।",
  },
  empty_solutions_title: { en: "No academic solutions found", hi: "कोई शैक्षणिक समाधान नहीं मिला" },
  empty_solutions_sub: {
    en: "Try adjusting your search query or selecting a different category.",
    hi: "अपनी खोज बदलें या कोई अन्य श्रेणी चुनें।",
  },
  empty_partnerships_title: {
    en: "No industry partnerships found",
    hi: "कोई उद्योग साझेदारी नहीं मिली",
  },
  empty_partnerships_sub: {
    en: "Try adjusting your search query or choosing a different category.",
    hi: "अपनी खोज बदलें या कोई अन्य श्रेणी चुनें।",
  },

  // ── Card labels ───────────────────────────────────────────────────────────
  card_problem_label: { en: "Problem:", hi: "समस्या:" },
  card_view_details: { en: "View Details →", hi: "विवरण देखें →" },
  card_view_solution: { en: "View Solution Details →", hi: "समाधान विवरण देखें →" },
  card_partnership_proposals: { en: "partnership proposal", hi: "साझेदारी प्रस्ताव" },
  card_partnership_proposals_plural: { en: "partnership proposals", hi: "साझेदारी प्रस्ताव" },
  card_university_label: { en: "University:", hi: "विश्वविद्यालय:" },
  card_problem_card_label: { en: "Problem:", hi: "समस्या:" },
  card_industry_suffix: { en: "(Industry)", hi: "(उद्योग)" },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer_tagline: {
    en: "JanSamadhan — Empowering Citizens, Universities & Industry for Civic Impact.",
    hi: "JanSamadhan — नागरिकों, विश्वविद्यालयों और उद्योगों को नागरिक प्रभाव के लिए सशक्त बनाना।",
  },
  footer_rights: { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।" },

  // ── Login page ────────────────────────────────────────────────────────────
  login_subtitle: {
    en: "Civic Problem Solving & Research Platform",
    hi: "नागरिक समस्या समाधान और अनुसंधान मंच",
  },
  login_welcome: { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  login_welcome_sub: {
    en: "Sign in to access your dashboard and reports",
    hi: "अपने डैशबोर्ड और रिपोर्ट देखने के लिए लॉग इन करें",
  },
  login_identifier_label: { en: "Email or Phone number", hi: "ईमेल या मोबाइल नंबर" },
  login_identifier_placeholder: {
    en: "Enter email or mobile number",
    hi: "ईमेल या मोबाइल नंबर दर्ज करें",
  },
  login_password_label: { en: "Password", hi: "पासवर्ड" },
  login_password_placeholder: { en: "Enter your password", hi: "अपना पासवर्ड दर्ज करें" },
  login_btn: { en: "Log In", hi: "लॉग इन करें" },
  login_btn_loading: { en: "Signing in…", hi: "लॉग इन हो रहा है…" },
  login_no_account: { en: "Don't have an account?", hi: "खाता नहीं है?" },
  login_create_link: { en: "Create an account", hi: "खाता बनाएं" },
  login_show_pw: { en: "Show password", hi: "पासवर्ड दिखाएं" },
  login_hide_pw: { en: "Hide password", hi: "पासवर्ड छुपाएं" },
  login_error_default: { en: "Login failed", hi: "लॉग इन विफल रहा" },

  // ── Signup page ───────────────────────────────────────────────────────────
  signup_heading: { en: "Join JanSamadhan", hi: "JanSamadhan से जुड़ें" },
  signup_subtitle: {
    en: "Create your account to start making an impact",
    hi: "प्रभाव डालना शुरू करने के लिए अपना खाता बनाएं",
  },
  signup_role_label: { en: "I am joining as a…", hi: "मैं जुड़ रहा/रही हूँ…" },
  signup_role_citizen_label: { en: "Citizen", hi: "नागरिक" },
  signup_role_citizen_desc: {
    en: "Report civic problems in your community & track progress",
    hi: "अपने समुदाय की नागरिक समस्याओं की रिपोर्ट करें और प्रगति ट्रैक करें",
  },
  signup_role_university_label: { en: "University / Research Lab", hi: "विश्वविद्यालय / शोध प्रयोगशाला" },
  signup_role_university_desc: {
    en: "Propose scientific solutions & technical research",
    hi: "वैज्ञानिक समाधान और तकनीकी शोध प्रस्तावित करें",
  },
  signup_role_industry_label: { en: "Industry Partner", hi: "उद्योग साझेदार" },
  signup_role_industry_desc: {
    en: "Provide CSR funds, equipment & deploy scalable solutions",
    hi: "CSR फ़ंड, उपकरण प्रदान करें और व्यापक समाधान लागू करें",
  },
  signup_org_label: { en: "Organization Name", hi: "संस्था का नाम" },
  signup_org_placeholder_uni: {
    en: "e.g. IIT Bombay Research Lab",
    hi: "जैसे: IIT Bombay Research Lab",
  },
  signup_org_placeholder_industry: {
    en: "e.g. Tata Sustainability Foundation",
    hi: "जैसे: Tata Sustainability Foundation",
  },
  signup_org_hint: {
    en: "Official name of your university department, research lab, or corporate entity.",
    hi: "आपके विश्वविद्यालय विभाग, शोध प्रयोगशाला या कॉर्पोरेट संस्था का आधिकारिक नाम।",
  },
  signup_name_label: { en: "Full Name or Contact Person", hi: "पूरा नाम या संपर्क व्यक्ति" },
  signup_name_placeholder: { en: "e.g. Priya Sharma", hi: "जैसे: Priya Sharma" },
  signup_email_label: { en: "Email Address", hi: "ईमेल पता" },
  signup_phone_label: { en: "Phone Number", hi: "मोबाइल नंबर" },
  signup_contact_hint: {
    en: "Provide at least one (email or mobile number)",
    hi: "कम से कम एक दर्ज करें (ईमेल या मोबाइल नंबर)",
  },
  signup_password_label: { en: "Create Password", hi: "पासवर्ड बनाएं" },
  signup_password_placeholder: { en: "At least 6 characters", hi: "कम से कम 6 अक्षर" },
  signup_btn: { en: "Create Account", hi: "खाता बनाएं" },
  signup_btn_loading: { en: "Creating account…", hi: "खाता बन रहा है…" },
  signup_have_account: { en: "Already have an account?", hi: "पहले से खाता है?" },
  signup_login_link: { en: "Log in", hi: "लॉग इन करें" },
  signup_error_contact: {
    en: "Please provide either an email or phone number",
    hi: "कृपया ईमेल या मोबाइल नंबर में से कोई एक दर्ज करें",
  },
  signup_error_org: {
    en: "Organization Name is required for University and Industry Partner roles",
    hi: "विश्वविद्यालय और उद्योग साझेदार के लिए संस्था का नाम आवश्यक है",
  },
  signup_error_default: { en: "Signup failed", hi: "खाता नहीं बन सका" },

  // ── Language toggle ───────────────────────────────────────────────────────
  lang_toggle_label: { en: "Switch to Hindi", hi: "अंग्रेज़ी में बदलें" },
} as const;

export type TranslationKey = keyof typeof translations;

/** Returns the translated string for the given key and language. */
export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
