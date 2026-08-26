const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const { Corporation, Zone, Ward, Locality, Street } = require("../models/Location");

const seedDatabase = async (req, res) => {
  try {
    // ── 1. Seed Locations Hierarchy (Corporations -> Zones -> Wards -> Localities -> Streets) ──
    await Corporation.deleteMany({});
    await Zone.deleteMany({});
    await Ward.deleteMany({});
    await Locality.deleteMany({});
    await Street.deleteMany({});

    // 1.1 Corporations
    const gcc = await Corporation.create({
      name: "Greater Chennai Corporation",
      tamilName: "பெருநகர சென்னை மாநகராட்சி",
      code: "GCC",
      district: "Chennai",
      state: "Tamil Nadu",
      centerLat: 13.0827,
      centerLng: 80.2707,
    });

    const ccmc = await Corporation.create({
      name: "Coimbatore City Municipal Corporation",
      tamilName: "கோயம்புத்தூர் மாநகராட்சி",
      code: "CCMC",
      district: "Coimbatore",
      state: "Tamil Nadu",
      centerLat: 11.0168,
      centerLng: 76.9558,
    });

    const mmc = await Corporation.create({
      name: "Madurai Municipal Corporation",
      tamilName: "மதுரை மாநகராட்சி",
      code: "MMC",
      district: "Madurai",
      state: "Tamil Nadu",
      centerLat: 9.9252,
      centerLng: 78.1198,
    });

    const tcc = await Corporation.create({
      name: "Tiruchirappalli City Corporation",
      tamilName: "திருச்சிராப்பள்ளி மாநகராட்சி",
      code: "TCC",
      district: "Tiruchirappalli",
      state: "Tamil Nadu",
      centerLat: 10.7905,
      centerLng: 78.7047,
    });

    const smc = await Corporation.create({
      name: "Salem City Municipal Corporation",
      tamilName: "சேலம் மாநகராட்சி",
      code: "SMC",
      district: "Salem",
      state: "Tamil Nadu",
      centerLat: 11.6643,
      centerLng: 78.1460,
    });

    // 1.2 Zones for GCC
    const gccZonesData = [
      { corporationId: gcc._id, zoneNumber: 5, name: "Zone 5 - Royapuram", tamilName: "மண்டலம் 5 - ராயபுரம்", code: "Z05-ROY", centerLat: 13.109, centerLng: 80.294 },
      { corporationId: gcc._id, zoneNumber: 8, name: "Zone 8 - Anna Nagar", tamilName: "மண்டலம் 8 - அண்ணா நகர்", code: "Z08-ANR", centerLat: 13.085, centerLng: 80.21 },
      { corporationId: gcc._id, zoneNumber: 9, name: "Zone 9 - Teynampet", tamilName: "மண்டலம் 9 - தேனாம்பேட்டை", code: "Z09-TYN", centerLat: 13.04, centerLng: 80.245 },
      { corporationId: gcc._id, zoneNumber: 10, name: "Zone 10 - Kodambakkam", tamilName: "மண்டலம் 10 - கோடம்பாக்கம்", code: "Z10-KOD", centerLat: 13.052, centerLng: 80.22 },
      { corporationId: gcc._id, zoneNumber: 13, name: "Zone 13 - Adyar", tamilName: "மண்டலம் 13 - அடையாறு", code: "Z13-ADY", centerLat: 13.0012, centerLng: 80.2565 },
    ];
    const gccZones = await Zone.insertMany(gccZonesData);

    // Zones for Coimbatore (CCMC)
    const ccmcZonesData = [
      { corporationId: ccmc._id, zoneNumber: 1, name: "Central Zone - Gandhipuram", tamilName: "மத்திய மண்டலம் - காந்திபுரம்", code: "CCMC-CZ", centerLat: 11.0175, centerLng: 76.968 },
      { corporationId: ccmc._id, zoneNumber: 2, name: "East Zone - Singanallur", tamilName: "கிழக்கு மண்டலம் - சிங்காநல்லூர்", code: "CCMC-EZ", centerLat: 11.002, centerLng: 77.025 },
      { corporationId: ccmc._id, zoneNumber: 3, name: "West Zone - RS Puram", tamilName: "மேற்கு மண்டலம் - ஆர்.எஸ்.புரம்", code: "CCMC-WZ", centerLat: 11.01, centerLng: 76.945 },
    ];
    await Zone.insertMany(ccmcZonesData);

    // Zones for Madurai (MMC)
    const mmcZonesData = [
      { corporationId: mmc._id, zoneNumber: 1, name: "Zone 1 - Meenakshi Temple", tamilName: "மண்டலம் 1 - மீனாட்சி அம்மன் கோவில்", code: "MMC-Z1", centerLat: 9.9195, centerLng: 78.1193 },
      { corporationId: mmc._id, zoneNumber: 2, name: "Zone 2 - KK Nagar", tamilName: "மண்டலம் 2 - கே.கே. நகர்", code: "MMC-Z2", centerLat: 9.932, centerLng: 78.145 },
    ];
    await Zone.insertMany(mmcZonesData);

    // 1.3 Wards for GCC Zone 8 (Anna Nagar)
    const zone8 = gccZones.find((z) => z.zoneNumber === 8);
    const zone5 = gccZones.find((z) => z.zoneNumber === 5);
    const zone9 = gccZones.find((z) => z.zoneNumber === 9);
    const zone10 = gccZones.find((z) => z.zoneNumber === 10);
    const zone13 = gccZones.find((z) => z.zoneNumber === 13);

    const wardsData = [
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 98, wardName: "Ward 98 - Anna Nagar East", tamilName: "வார்டு 98 - அண்ணா நகர் கிழக்கு", centerLat: 13.087, centerLng: 80.218 },
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 99, wardName: "Ward 99 - Anna Nagar West", tamilName: "வார்டு 99 - அண்ணா நகர் மேற்கு", centerLat: 13.083, centerLng: 80.205 },
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 100, wardName: "Ward 100 - Shenoy Nagar", tamilName: "வார்டு 100 - செனாய் நகர்", centerLat: 13.078, centerLng: 80.225 },
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 101, wardName: "Ward 101 - Aminjikarai", tamilName: "வார்டு 101 - அமைந்தகரை", centerLat: 13.072, centerLng: 80.216 },
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 102, wardName: "Ward 102 - Shanthi Colony", tamilName: "வார்டு 102 - சாந்தி காலனி", centerLat: 13.086, centerLng: 80.212 },
      { corporationId: gcc._id, zoneId: zone8._id, wardNumber: 104, wardName: "Ward 104 - Thirumangalam", tamilName: "வார்டு 104 - திருமங்கலம்", centerLat: 13.089, centerLng: 80.198 },
      
      // Zone 9 (Teynampet)
      { corporationId: gcc._id, zoneId: zone9._id, wardNumber: 114, wardName: "Ward 114 - T. Nagar North", tamilName: "வார்டு 114 - தி.நகர் வடக்கு", centerLat: 13.045, centerLng: 80.235 },
      { corporationId: gcc._id, zoneId: zone9._id, wardNumber: 115, wardName: "Ward 115 - Pondy Bazaar", tamilName: "வார்டு 115 - பாண்டி பஜார்", centerLat: 13.041, centerLng: 80.239 },

      // Zone 10 (Kodambakkam)
      { corporationId: gcc._id, zoneId: zone10._id, wardNumber: 128, wardName: "Ward 128 - Ashok Nagar", tamilName: "வார்டு 128 - அசோக் நகர்", centerLat: 13.036, centerLng: 80.212 },
      { corporationId: gcc._id, zoneId: zone10._id, wardNumber: 130, wardName: "Ward 130 - Vadapalani", tamilName: "வார்டு 130 - வடபழனி", centerLat: 13.05, centerLng: 80.208 },

      // Zone 13 (Adyar)
      { corporationId: gcc._id, zoneId: zone13._id, wardNumber: 170, wardName: "Ward 170 - Besant Nagar", tamilName: "வார்டு 170 - பெசன்ட் நகர்", centerLat: 13.0, centerLng: 80.265 },
      { corporationId: gcc._id, zoneId: zone13._id, wardNumber: 172, wardName: "Ward 172 - Thiruvanmiyur", tamilName: "வார்டு 172 - திருவான்மியூர்", centerLat: 12.985, centerLng: 80.259 },
    ];
    const gccWards = await Ward.insertMany(wardsData);

    const ward102 = gccWards.find((w) => w.wardNumber === 102);
    const ward99 = gccWards.find((w) => w.wardNumber === 99);
    const ward98 = gccWards.find((w) => w.wardNumber === 98);
    const ward114 = gccWards.find((w) => w.wardNumber === 114);
    const ward128 = gccWards.find((w) => w.wardNumber === 128);

    // 1.4 Localities
    const localitiesData = [
      // In Ward 102
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, name: "Shanthi Colony Main", tamilName: "சாந்தி காலனி பிரதான பகுதி", pincode: "600040", centerLat: 13.086, centerLng: 80.212 },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, name: "Tower Park Enclave", tamilName: "டவர் பூங்கா பகுதி", pincode: "600040", centerLat: 13.088, centerLng: 80.214 },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, name: "Roundtana Junction", tamilName: "ரவுண்டானா சந்திப்பு", pincode: "600040", centerLat: 13.0845, centerLng: 80.215 },
      
      // In Ward 99
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward99._id, name: "Anna Nagar West Extn", tamilName: "அண்ணா நகர் மேற்கு விரிவு", pincode: "600101", centerLat: 13.082, centerLng: 80.201 },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward99._id, name: "Millennium Park Enclave", tamilName: "மில்லினியம் பார்க் குடியிருப்பு", pincode: "600101", centerLat: 13.081, centerLng: 80.203 },

      // In Ward 98
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward98._id, name: "Chintamani Market", tamilName: "சிந்தாமணி சந்தை பகுதி", pincode: "600102", centerLat: 13.0895, centerLng: 80.219 },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward98._id, name: "East Main Avenue", tamilName: "கிழக்கு மெயின் அவென்யூ", pincode: "600102", centerLat: 13.0875, centerLng: 80.216 },

      // In Ward 114 (T. Nagar)
      { corporationId: gcc._id, zoneId: zone9._id, wardId: ward114._id, name: "Usman Road Commercial Hub", tamilName: "உஸ்மான் சாலை வணிக வளாகம்", pincode: "600017", centerLat: 13.045, centerLng: 80.235 },
      { corporationId: gcc._id, zoneId: zone9._id, wardId: ward114._id, name: "Panagal Park Surrounds", tamilName: "பனகல் பார்க் சுற்றுவட்டாரம்", pincode: "600017", centerLat: 13.042, centerLng: 80.232 },
    ];
    const gccLocalities = await Locality.insertMany(localitiesData);

    const shanthiLoc = gccLocalities.find((l) => l.name === "Shanthi Colony Main");
    const towerLoc = gccLocalities.find((l) => l.name === "Tower Park Enclave");
    const roundtanaLoc = gccLocalities.find((l) => l.name === "Roundtana Junction");
    const westLoc = gccLocalities.find((l) => l.name === "Anna Nagar West Extn");
    const usmanLoc = gccLocalities.find((l) => l.name === "Usman Road Commercial Hub");

    // 1.5 Streets
    const streetsData = [
      // Shanthi Colony Streets
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: shanthiLoc._id, name: "2nd Avenue Main Road", tamilName: "2வது அவென்யூ மெயின் ரோடு", pincode: "600040" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: shanthiLoc._id, name: "4th Main Road, Shanthi Colony", tamilName: "4வது மெயின் ரோடு, சாந்தி காலனி", pincode: "600040" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: shanthiLoc._id, name: "AH Block 11th Street", tamilName: "ஏ.எச். பிளாக் 11வது தெரு", pincode: "600040" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: shanthiLoc._id, name: "AJ Block 5th Cross Street", tamilName: "ஏ.ஜே. பிளாக் 5வது குறுக்குத் தெரு", pincode: "600040" },
      
      // Tower Park Streets
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: towerLoc._id, name: "Tower Club Road", tamilName: "டவர் கிளப் ரோடு", pincode: "600040" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: towerLoc._id, name: "Park Entrance Cross Street", tamilName: "பூங்கா நுழைவு வாயில் குறுக்குத் தெரு", pincode: "600040" },
      
      // Roundtana Streets
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: roundtanaLoc._id, name: "Metro Station Plaza Road", tamilName: "மெட்ரோ நிலையம் பிளாசா சாலை", pincode: "600040" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward102._id, localityId: roundtanaLoc._id, name: "W-Block 3rd Main Street", tamilName: "டபிள்யூ-பிளாக் 3வது மெயின் தெரு", pincode: "600040" },
      
      // Anna Nagar West Extn Streets
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward99._id, localityId: westLoc._id, name: "Thirumangalam Road Junction", tamilName: "திருமங்கலம் சாலை சந்திப்பு", pincode: "600101" },
      { corporationId: gcc._id, zoneId: zone8._id, wardId: ward99._id, localityId: westLoc._id, name: "Sector 5 Cross Road", tamilName: "செக்டார் 5 குறுக்கு சாலை", pincode: "600101" },

      // Usman Road Streets
      { corporationId: gcc._id, zoneId: zone9._id, wardId: ward114._id, localityId: usmanLoc._id, name: "South Usman Flyover Road", tamilName: "தெற்கு உஸ்மான் மேம்பால சாலை", pincode: "600017" },
      { corporationId: gcc._id, zoneId: zone9._id, wardId: ward114._id, localityId: usmanLoc._id, name: "Ranganathan Street Junction", tamilName: "ரங்கநாதன் தெரு சந்திப்பு", pincode: "600017" },
    ];
    await Street.insertMany(streetsData);

    // ── 2. Seed Departments ──
    const deptData = [
      {
        departmentName: "Roads Department",
        description: "Repairs potholes, damaged asphalt, sidewalks, and road infrastructure.",
        issueCategories: ["Pothole / Road Damage"],
        contactEmail: "roads.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Sanitation Department",
        description: "Handles garbage collection, waste containers, street cleaning, and municipal hygiene.",
        issueCategories: ["Garbage"],
        contactEmail: "sanitation.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Water Supply Department",
        description: "Oversees drinking water distribution, pipeline ruptures, supply valves, and water quality.",
        issueCategories: ["Water Leakage"],
        contactEmail: "watersupply.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Drainage Department",
        description: "Handles underground sewerage, storm water drainage, manhole covers, and canal overflows.",
        issueCategories: ["Drainage Problem"],
        contactEmail: "drainage.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Electrical Department",
        description: "Manages municipal streetlights, electrical posts, transformer wiring, and junction boxes.",
        issueCategories: ["Streetlight Problem"],
        contactEmail: "electrical.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Parks & Environment Department",
        description: "Maintains public parks, tree trimming, garden infrastructure, and environmental care.",
        issueCategories: ["Parks / Environment"],
        contactEmail: "parks.dept@chennaicorporation.gov.in",
      },
      {
        departmentName: "Public Health Department",
        description: "Handles mosquito fogging, public sanitation hazards, and health safety inspections.",
        issueCategories: ["Public Health"],
        contactEmail: "health.dept@chennaicorporation.gov.in",
      },
    ];

    const departments = {};
    for (const d of deptData) {
      let dept = await Department.findOne({ departmentName: d.departmentName });
      if (!dept) {
        dept = await Department.create(d);
      }
      departments[d.departmentName] = dept;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // ── 3. Seed Users for All Departments and Roles ──
    const usersData = [
      {
        name: "Dr. J. Radhakrishnan, IAS (Commissioner)",
        email: "admin@civic.ai",
        password: hashedPassword,
        role: "admin",
        phone: "+91-98401-00001",
        address: "Ripon Building, Greater Chennai Corporation Headquarters",
        ward: "Ward 102",
      },
      // 1. Roads
      {
        name: "Er. R. Rajesh (Executive Engineer, Roads)",
        email: "head.roads@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Roads Department"]._id,
        phone: "+91-98401-00002",
        address: "Zone 8 Divisional Office, Anna Nagar",
        ward: "Ward 102",
      },
      {
        name: "M. Murugan (Roads Field Inspector)",
        email: "staff.roads@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Roads Department"]._id,
        phone: "+91-98401-00003",
        address: "Ward 102 Field Operations Unit, Shanthi Colony",
        ward: "Ward 102",
      },
      // 2. Sanitation
      {
        name: "Dr. S. Meenakshi (Health Officer, Sanitation)",
        email: "head.sanitation@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Sanitation Department"]._id,
        phone: "+91-98401-00004",
        address: "Public Health & Solid Waste Management Division",
        ward: "Ward 99",
      },
      {
        name: "K. Selvam (Sanitary Field Inspector)",
        email: "staff.sanitation@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Sanitation Department"]._id,
        phone: "+91-98401-00005",
        address: "Ward 99 Conservancy Office",
        ward: "Ward 99",
      },
      // 3. Water Supply
      {
        name: "P. Karthikeyan (Asst Engineer, Water Supply)",
        email: "head.water@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Water Supply Department"]._id,
        phone: "+91-98401-00006",
        address: "Metro Water Works Division, Zone 8",
        ward: "Ward 102",
      },
      {
        name: "V. Anbarasan (Water Pipeline Inspector)",
        email: "staff.water@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Water Supply Department"]._id,
        phone: "+91-98401-00007",
        address: "Pumping Station 4, Anna Nagar West",
        ward: "Ward 99",
      },
      // 4. Drainage
      {
        name: "T. Narayanan (Divisional Engineer, Drainage)",
        email: "head.drainage@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Drainage Department"]._id,
        phone: "+91-98401-00008",
        address: "Drainage & Sewerage Board, Zone 8",
        ward: "Ward 102",
      },
      {
        name: "G. Palani (Drainage & Sewerage Inspector)",
        email: "staff.drainage@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Drainage Department"]._id,
        phone: "+91-98401-00009",
        address: "Sewer Maintenance Depot, Anna Nagar",
        ward: "Ward 102",
      },
      // 5. Electrical
      {
        name: "A. Suresh Kumar (Executive Engineer, Electrical)",
        email: "head.electrical@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Electrical Department"]._id,
        phone: "+91-98401-00010",
        address: "Street Lighting Division, Ripon Building",
        ward: "Ward 102",
      },
      {
        name: "D. Velu (Streetlight Line Inspector)",
        email: "staff.electrical@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Electrical Department"]._id,
        phone: "+91-98401-00011",
        address: "Electrical Operations Sub-station, Shanthi Colony",
        ward: "Ward 102",
      },
      // 6. Parks & Environment
      {
        name: "R. Sundari (Horticulture Officer, Parks)",
        email: "head.parks@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Parks & Environment Department"]._id,
        phone: "+91-98401-00012",
        address: "Horticulture Division, Tower Park",
        ward: "Ward 102",
      },
      {
        name: "M. Kumar (Parks Maintenance Inspector)",
        email: "staff.parks@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Parks & Environment Department"]._id,
        phone: "+91-98401-00013",
        address: "Tower Park Maintenance Office",
        ward: "Ward 102",
      },
      // 7. Public Health
      {
        name: "Dr. K. Vasanthi (Chief Medical Officer, Health)",
        email: "head.health@civic.ai",
        password: hashedPassword,
        role: "department_head",
        department: departments["Public Health Department"]._id,
        phone: "+91-98401-00014",
        address: "Public Health Directorate, GCC",
        ward: "Ward 99",
      },
      {
        name: "S. Manikandan (Public Health Inspector)",
        email: "staff.health@civic.ai",
        password: hashedPassword,
        role: "staff",
        department: departments["Public Health Department"]._id,
        phone: "+91-98401-00015",
        address: "Urban Primary Health Center, Shenoy Nagar",
        ward: "Ward 100",
      },
      // Citizens
      {
        name: "S. Sundararaman (Citizen Resident)",
        email: "citizen@civic.ai",
        password: hashedPassword,
        role: "citizen",
        phone: "+91-98765-43210",
        address: "Plot 42, 2nd Avenue, Shanthi Colony, Anna Nagar",
        ward: "Ward 102",
      },
      {
        name: "K. Priya (Citizen Resident)",
        email: "priya@civic.ai",
        password: hashedPassword,
        role: "citizen",
        phone: "+91-98765-43211",
        address: "15 Gandhi Road, Ward 98, Anna Nagar East",
        ward: "Ward 98",
      },
    ];

    const users = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
      } else {
        user.name = u.name;
        user.role = u.role;
        user.department = u.department || null;
        user.phone = u.phone;
        user.address = u.address;
        user.ward = u.ward;
        user.password = hashedPassword;
        await user.save();
      }
      users[u.email] = user;
    }

    // Link Heads and Staff to Departments
    departments["Roads Department"].departmentHead = users["head.roads@civic.ai"]._id;
    departments["Roads Department"].staffMembers = [users["staff.roads@civic.ai"]._id];
    await departments["Roads Department"].save();

    departments["Sanitation Department"].departmentHead = users["head.sanitation@civic.ai"]._id;
    departments["Sanitation Department"].staffMembers = [users["staff.sanitation@civic.ai"]._id];
    await departments["Sanitation Department"].save();

    departments["Water Supply Department"].departmentHead = users["head.water@civic.ai"]._id;
    departments["Water Supply Department"].staffMembers = [users["staff.water@civic.ai"]._id];
    await departments["Water Supply Department"].save();

    departments["Drainage Department"].departmentHead = users["head.drainage@civic.ai"]._id;
    departments["Drainage Department"].staffMembers = [users["staff.drainage@civic.ai"]._id];
    await departments["Drainage Department"].save();

    departments["Electrical Department"].departmentHead = users["head.electrical@civic.ai"]._id;
    departments["Electrical Department"].staffMembers = [users["staff.electrical@civic.ai"]._id];
    await departments["Electrical Department"].save();

    departments["Parks & Environment Department"].departmentHead = users["head.parks@civic.ai"]._id;
    departments["Parks & Environment Department"].staffMembers = [users["staff.parks@civic.ai"]._id];
    await departments["Parks & Environment Department"].save();

    departments["Public Health Department"].departmentHead = users["head.health@civic.ai"]._id;
    departments["Public Health Department"].staffMembers = [users["staff.health@civic.ai"]._id];
    await departments["Public Health Department"].save();

    // ── 4. Grievance Complaints (Keep Fresh / 0 complaints) ──
    await Complaint.deleteMany({});
    const sampleComplaints = [];

    res.status(200).json({
      success: true,
      message: "Database successfully seeded with Tamil Nadu Municipal Location Hierarchy & Grievance Records!",
      corporationsCount: 5,
      zonesCount: gccZonesData.length + ccmcZonesData.length + mmcZonesData.length,
      wardsCount: wardsData.length,
      localitiesCount: localitiesData.length,
      streetsCount: streetsData.length,
      complaintsCount: sampleComplaints.length,
      accounts: {
        citizen: "citizen@civic.ai / password123",
        fieldStaff: "staff.roads@civic.ai / password123",
        departmentHead: "head.roads@civic.ai / password123",
        commissioner: "admin@civic.ai / password123",
      },
    });
  } catch (error) {
    console.error("Seed Database Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  seedDatabase,
};
