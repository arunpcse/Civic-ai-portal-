import React, { createContext, useState, useEffect, useContext } from "react";

export const LanguageContext = createContext();

const translations = {
  en: {
    // Header & Ticker
    gov_tn: "Government of Tamil Nadu",
    gov_dept: "Municipal Administration & Water Supply Department",
    helpline: "24x7 Citizen Helpline: 1913 / 1100",
    portal_title: "CivicAI Grievance Portal",
    portal_sub: "Public Grievance Redressal & Civic Infrastructure Management System",
    logout: "Logout",
    sign_in: "Sign In",
    register_btn: "New Citizen Registration",

    // Navigation
    nav_menu: "Menu",
    citizen_overview: "Citizen Overview",
    lodge_grievance: "Lodge Grievance",
    my_grievances: "My Grievances",
    work_orders: "Assigned Work Orders",
    dept_operations: "Department Operations",
    commissioner_intel: "Commissioner Intelligence",
    system_live: "CivicAI Engine Active",

    // Roles
    role_citizen: "Citizen Resident Portal",
    role_staff: "Field Staff Operations",
    role_head: "Department Nodal Head",
    role_admin: "Municipal Commissioner",

    // Login
    select_role_title: "Select Official Portal to Sign In",
    select_role_desc: "Dedicated secure portals for Citizens, Field Officers, Department Heads, and Municipal Commissioners.",
    email_label: "Official Email Address",
    password_label: "Password",
    sign_in_btn: "Sign In to Portal",
    authenticating: "Authenticating...",
    new_citizen_prompt: "New resident citizen?",
    register_account_link: "Register Citizen Account",
    demo_credentials_title: "Demo Login Credentials:",
    default_pass_note: "Default: password123",

    // Register
    reg_title: "Citizen Registration",
    reg_sub: "Create a resident profile to lodge grievances and track municipal resolutions",
    full_name: "Full Name",
    mobile_number: "Mobile Number",
    residential_address: "Residential Address",
    municipal_ward: "Municipal Ward",
    complete_reg_btn: "Complete Registration",
    creating_account: "Creating Account...",
    already_registered: "Already have an account?",

    // Report Complaint
    form_tag: "Grievance Form",
    report_title: "Lodge Public Grievance",
    report_sub: "Submit defect details, 6-tier municipal location, inspection photo, and GPS pin for rapid civic resolution.",
    sec1_category: "1. Select Issue Category",
    sec2_title: "2. Grievance Title",
    sec3_desc: "3. Detailed Issue Description",
    sec4_photo: "4. Defect Inspection Photograph (For YOLO Defect Verification)",
    sec5_location: "5. 6-Tier Municipal Location Hierarchy",
    tier1_corp: "Tier 1: Corporation",
    tier2_zone: "Tier 2: Municipal Zone",
    tier3_ward: "Tier 3: Ward",
    tier4_locality: "Tier 4: Locality",
    tier5_street: "Tier 5: Street",
    tier6_specific: "Tier 6: Specific Landmark / Door No",
    gps_btn: "Use My Current Location",
    gps_detecting: "Acquiring GPS fix...",
    map_click_prompt: "Click on map to pin exact defect coordinates:",
    cancel_btn: "Cancel",
    submit_btn: "Submit Grievance",
    submitting_ai: "Processing AI Verification...",

    // Categories
    cat_roads: "Roads & Potholes",
    cat_roads_desc: "Cracked asphalt, craters, broken pavers",
    cat_garbage: "Solid Waste & Garbage",
    cat_garbage_desc: "Overflowing dumper bins, street litter",
    cat_water: "Water Supply Leaks",
    cat_water_desc: "Burst pipelines, low pressure, valve leak",
    cat_drainage: "Drainage & Sewerage",
    cat_drainage_desc: "Clogged drains, manhole overflow",
    cat_lights: "Street Lights & Power",
    cat_lights_desc: "Dark lamp posts, broken luminaires",

    // Detail & List
    back_to_list: "Back to Grievance Registry",
    refresh: "Refresh Records",
    filed_on: "Filed On",
    incident_desc: "Citizen Incident Description",
    stage_tracker: "Grievance Action Stage Tracker (10-Stage Workflow)",
    current_stage: "Current Stage",
    photos_heading: "Inspection & Resolution Photos",
    before_photo: "1. Before Repair (Initial Citizen Photo)",
    after_photo: "2. After Repair (Field Officer Verification)",
    work_remarks: "Work Remarks",
    gps_coordinates: "Geospatial Defect Coordinates",
    full_address: "Full Address",
    ai_diagnostics: "AI Verification & Routing Diagnostics",
    ai_category: "AI Verified Category",
    ai_confidence: "YOLO Model Confidence",
    dedup_check: "Deduplication Check",
    assigned_dept: "Assigned Department",
    dispatched_staff: "Dispatched Field Staff",
    priority_score: "Priority Index Score",
    rating_title: "Citizen Resolution Rating & Feedback",
    rating_prompt: "Rate the quality of repair work (1 to 5 Stars)",
    feedback_placeholder: "Provide your feedback on the timeliness and quality of this repair...",
    submit_feedback_btn: "Submit Citizen Confirmation",
    search_placeholder: "Search by Reference ID (GRV-...), title, address...",
    filter_status: "Status",
    filter_category: "Category",
    all_statuses: "All Statuses",
    all_categories: "All Categories",
    no_records: "No matching grievances found",
  },
  ta: {
    // Header & Ticker
    gov_tn: "தமிழ்நாடு அரசு",
    gov_dept: "நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை",
    helpline: "24x7 குடிமக்கள் உதவி எண்: 1913 / 1100",
    portal_title: "CivicAI குறைதீர்க்கும் தளம்",
    portal_sub: "பொதுக் குறைதீர்ப்பு மற்றும் நகர்ப்புற உள்கட்டமைப்பு மேலாண்மை அமைப்பு",
    logout: "வெளியேறு",
    sign_in: "உள்நுழைக",
    register_btn: "புதிய குடிமக்கள் பதிவு",

    // Navigation
    nav_menu: "பட்டியல்",
    citizen_overview: "குடிமக்கள் முகப்பு",
    lodge_grievance: "புதிய புகார் பதிவு",
    my_grievances: "என் புகார்கள்",
    work_orders: "பணிக் கட்டளைகள்",
    dept_operations: "துறை செயல்பாடுகள்",
    commissioner_intel: "ஆணையர் கட்டுப்பாட்டகம்",
    system_live: "CivicAI செயலில் உள்ளது",

    // Roles
    role_citizen: "குடிமக்கள் சேவை முகப்பு",
    role_staff: "களப் பணியாளர் பிரிவு",
    role_head: "துறைத் தலைமை முகப்பு",
    role_admin: "மாநகராட்சி ஆணையர்",

    // Login
    select_role_title: "உள்நுழைய உங்கள் அதிகாரப்பூர்வ முகப்பைத் தேர்ந்தெடுக்கவும்",
    select_role_desc: "குடிமக்கள், களப் பொறியாளர்கள், துறைத் தலைவர்கள் மற்றும் ஆணையர்களுக்கான பிரத்யேக பாதுகாப்பு தளம்.",
    email_label: "அங்கீகரிக்கப்பட்ட மின்னஞ்சல் முகவரி",
    password_label: "கடவுச்சொல்",
    sign_in_btn: "தளத்தில் உள்நுழைக",
    authenticating: "சரிபார்க்கிறது...",
    new_citizen_prompt: "புதிய குடிமகனா?",
    register_account_link: "புதிய கணக்கு பதிவு செய்க",
    demo_credentials_title: "டெமோ உள்நுழைவு விவரங்கள்:",
    default_pass_note: "இயல்புநிலை: password123",

    // Register
    reg_title: "புதிய குடிமக்கள் பதிவு",
    reg_sub: "மாநகராட்சி குறைகளை பதிவு செய்து தீர்வுகளை கண்காணிக்க உங்கள் சுயவிவரத்தை உருவாக்கவும்",
    full_name: "முழுப் பெயர்",
    mobile_number: "அலைபேசி எண்",
    residential_address: "முகவரி",
    municipal_ward: "வார்டு எண்",
    complete_reg_btn: "பதிவை முடிக்கவும்",
    creating_account: "கணக்கு உருவாக்கப்படுகிறது...",
    already_registered: "ஏற்கனவே கணக்கு உள்ளதா?",

    // Report Complaint
    form_tag: "புகார் படிவம்",
    report_title: "பொதுக் குறையைப் பதிவு செய்க",
    report_sub: "குறைபாடு விவரம், 6-அடுக்கு நகராட்சி இடம், புகைப்படம் மற்றும் GPS இருப்பிடத்தை சமர்ப்பிக்கவும்.",
    sec1_category: "1. புகாரின் வகையைத் தேர்வு செய்க",
    sec2_title: "2. புகாரின் தலைப்பு",
    sec3_desc: "3. விரிவான விளக்கம்",
    sec4_photo: "4. குறைபாடு புகைப்படம் (YOLO சரிபார்ப்பிற்கு)",
    sec5_location: "5. 6-அடுக்கு நகராட்சி நிர்வாக இட விவரம்",
    tier1_corp: "அடுக்கு 1: மாநகராட்சி",
    tier2_zone: "அடுக்கு 2: மண்டலம்",
    tier3_ward: "அடுக்கு 3: வார்டு",
    tier4_locality: "அடுக்கு 4: பகுதி",
    tier5_street: "அடுக்கு 5: தெரு",
    tier6_specific: "அடுக்கு 6: குறிப்பிட்ட இடம் / கதவு எண்",
    gps_btn: "என் தற்போதைய இருப்பிடம்",
    gps_detecting: "GPS கண்டறிகிறது...",
    map_click_prompt: "வரைபடத்தில் சரியான இடத்தை கிளிக் செய்க:",
    cancel_btn: "ரத்து செய்",
    submit_btn: "புகாரை சமர்ப்பிக்கவும்",
    submitting_ai: "AI சரிபார்ப்பு நடக்கிறது...",

    // Categories
    cat_roads: "சாலை மற்றும் பள்ளங்கள்",
    cat_roads_desc: "உடைந்த தார் சாலை, குண்டும் குழியுமான சாலை",
    cat_garbage: "குப்பை கழிவு மேலாண்மை",
    cat_garbage_desc: "நிரம்பி வழியும் தொட்டிகள், தெரு குப்பை",
    cat_water: "குடிநீர் குழாய் கசிவு",
    cat_water_desc: "குழாய் உடைப்பு, குறைந்த நீர் அழுத்தம்",
    cat_drainage: "கழிவுநீர் வடிகால் அடைப்பு",
    cat_drainage_desc: "சாக்கடை வழிதல், கழிவுநீர் தேக்கம்",
    cat_lights: "தெருவிளக்கு பழுது",
    cat_lights_desc: "எரியாத மின்விளக்கு, ஆபத்தான கம்பம்",

    // Detail & List
    back_to_list: "புகார் பதிவேட்டிற்குத் திரும்பு",
    refresh: "புதுப்பி",
    filed_on: "பதிவு செய்த நாள்",
    incident_desc: "குடிமக்கள் அளித்த விளக்கம்",
    stage_tracker: "10-அடுக்கு செயல்பாட்டுக் காலவரிசை",
    current_stage: "தற்போதைய நிலை",
    photos_heading: "ஆய்வு மற்றும் சீரமைப்பு புகைப்படங்கள்",
    before_photo: "1. பழுது பார்ப்பதற்கு முன் (குடிமகன் புகைப்படம்)",
    after_photo: "2. பழுது பார்த்த பின் (களப் பணியாளர் புகைப்படம்)",
    work_remarks: "பணி விளக்கம்",
    gps_coordinates: "GPS புவிசார் இருப்பிட விவரம்",
    full_address: "முழு முகவரி",
    ai_diagnostics: "AI சரிபார்ப்பு விவரங்கள்",
    ai_category: "AI உறுதி செய்த வகை",
    ai_confidence: "YOLO துல்லிய விகிதம்",
    dedup_check: "நகல் புகார் சோதனை",
    assigned_dept: "ஒதுக்கப்பட்ட துறை",
    dispatched_staff: "ஒதுக்கப்பட்ட களப் பணியாளர்",
    priority_score: "முன்னுரிமை மதிப்பீடு",
    rating_title: "குடிமக்கள் மதிப்பீடு மற்றும் கருத்து",
    rating_prompt: "பணியின் தரத்தை மதிப்பிடவும் (1 முதல் 5 நட்சத்திரங்கள்)",
    feedback_placeholder: "பணியின் தரம் மற்றும் வேகம் குறித்த உங்கள் கருத்துக்களைப் பகிரவும்...",
    submit_feedback_btn: "மதிப்பீட்டை சமர்ப்பிக்கவும்",
    search_placeholder: "புகார் எண் (GRV-...), தலைப்பு, முகவரியைத் தேடுக...",
    filter_status: "நிலை",
    filter_category: "வகை",
    all_statuses: "அனைத்து நிலைகளும்",
    all_categories: "அனைத்து வகைகளும்",
    no_records: "பொருத்தமான புகார்கள் எதுவும் இல்லை",
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("civic_lang") || "en";
  });

  const toggleLanguage = (selectedLang) => {
    const nextLang = selectedLang || (lang === "en" ? "ta" : "en");
    setLang(nextLang);
    localStorage.setItem("civic_lang", nextLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
