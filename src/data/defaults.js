export const DEFAULT_BRANCHES = {
  kerala: 'TC 12/445, Kowdiar\nThiruvananthapuram – 695003, Kerala\nPh: +91-471-2345678',
  rajasthan: '14-B, Malviya Nagar Industrial Area\nJaipur – 302017, Rajasthan\nPh: +91-141-2345678',
  uttarakhand: '23, Rajpur Road\nDehradun – 248001, Uttarakhand\nPh: +91-135-2345678',
  uttarpradesh: 'C-45, Sector 62, Noida – 201309\nUttar Pradesh\nPh: +91-120-2345678',
  tamilnadu: '7, Anna Salai, Nandanam\nChennai – 600035, Tamil Nadu\nPh: +91-44-23456789',
};

export const SD = {
  kerala: { name:'Kerala', code:'KL', discom:'KSEB (Kerala State Electricity Board)', agency:'ANERT (Agency for Non-conventional Energy & Rural Technology)', policy:'Kerala Solar Energy Policy 2013 & Net Metering Regulations 2014', avgTariff:5.5, exportRate:3.14, tariffEsc:5.5, netMeteringLimit:'1 MW', connTime:'30–45 days', nmSettle:'Monthly billing adjustment; Annual settlement at banking rate', tariff:[{s:'0–50 Units',r:'₹3.15/unit'},{s:'51–100 Units',r:'₹3.70/unit'},{s:'101–150 Units',r:'₹4.80/unit'},{s:'151–300 Units',r:'₹6.40/unit'},{s:'Above 300 Units',r:'₹7.20/unit'}], inc:[{i:'SGST Exemption on Panels',v:'100% exempted'},{i:'Export Tariff (APPC)',v:'₹3.14/unit'},{i:'ANERT Facilitation',v:'Subsidy support'},{i:'RPO Target',v:'17% FY2024-25'}] },
  rajasthan: { name:'Rajasthan', code:'RJ', discom:'JVVNL / AVVNL / JDVVNL', agency:'RRECL (Rajasthan Renewable Energy Corporation Ltd.)', policy:'Rajasthan Solar Energy Policy 2019 & Net Metering Regulation 2015', avgTariff:5.8, exportRate:3.58, tariffEsc:5.0, netMeteringLimit:'1 MW', connTime:'21–30 days', nmSettle:'Monthly bill adjustment; Excess credited at APPC rate', tariff:[{s:'0–50 Units',r:'₹3.05/unit'},{s:'51–150 Units',r:'₹5.00/unit'},{s:'151–300 Units',r:'₹6.50/unit'},{s:'Above 300 Units',r:'₹7.00/unit'}], inc:[{i:'Accelerated Depreciation 80%',v:'Commercial/Industrial'},{i:'Solar Policy 2019',v:'Single window clearance'},{i:'Export Tariff (APPC)',v:'₹3.58/unit'},{i:'Stamp Duty Exemption',v:'Land lease for solar'}] },
  uttarakhand: { name:'Uttarakhand', code:'UK', discom:'UPCL (Uttarakhand Power Corporation Ltd.)', agency:'UREDA (Uttarakhand Renewable Energy Development Agency)', policy:'Uttarakhand Solar Policy 2013 & UPCL Net Metering Regulations 2016', avgTariff:4.5, exportRate:3.00, tariffEsc:4.5, netMeteringLimit:'1 MW', connTime:'30–45 days', nmSettle:'Monthly adjustment; Annual settlement at APPC rate', tariff:[{s:'0–100 Units',r:'₹2.50/unit'},{s:'101–200 Units',r:'₹3.50/unit'},{s:'201–400 Units',r:'₹5.00/unit'},{s:'Above 400 Units',r:'₹6.00/unit'}], inc:[{i:'Hill District Incentive',v:'₹5,000/kW remote areas'},{i:'UREDA Facilitation',v:'Free site survey & DPR'},{i:'Export Tariff (APPC)',v:'₹3.00/unit'},{i:'Green Energy Corridor',v:'Priority connectivity'}] },
  uttarpradesh: { name:'Uttar Pradesh', code:'UP', discom:'UPPCL / Purvanchal / Paschimanchal / Madhyanchal Vidyut Vitaran', agency:'UPNEDA (UP New and Renewable Energy Development Agency)', policy:'UP Solar Energy Policy 2022 & UPERC Net Metering Regulation 2019', avgTariff:6.0, exportRate:3.71, tariffEsc:5.5, netMeteringLimit:'1 MW', connTime:'30–60 days', nmSettle:'Monthly billing adjustment; Quarterly settlement for excess', tariff:[{s:'0–150 Units',r:'₹5.50/unit'},{s:'151–300 Units',r:'₹6.00/unit'},{s:'301–500 Units',r:'₹6.50/unit'},{s:'Above 500 Units',r:'₹7.00/unit'}], inc:[{i:'UP Solar Policy 2022',v:'₹15,000/kW ≤3kW residential'},{i:'Electricity Duty Exempt',v:'100% 5 yrs commercial'},{i:'Export Tariff (APPC)',v:'₹3.71/unit'},{i:'UPNEDA Facilitation',v:'Single window clearance'}] },
  tamilnadu: { name:'Tamil Nadu', code:'TN', discom:'TANGEDCO (Tamil Nadu Generation & Distribution Corporation)', agency:'TEDA (Tamil Nadu Energy Development Agency)', policy:'Tamil Nadu Solar Energy Policy 2019 & TNERC Net Metering Regulations 2023', avgTariff:4.5, exportRate:3.50, tariffEsc:5.0, netMeteringLimit:'1 MW', connTime:'21–30 days', nmSettle:'Monthly bill credit; Annual financial settlement at APPC', tariff:[{s:'0–100 Units',r:'₹0 (Free)'},{s:'101–200 Units',r:'₹1.50/unit'},{s:'201–500 Units',r:'₹3.00/unit'},{s:'501–1000 Units',r:'₹5.00/unit'},{s:'Above 1000 Units',r:'₹7.00/unit'}], inc:[{i:'CM Solar Green House Scheme',v:'Enhanced domestic support'},{i:'Net Metering via TANGEDCO',v:'Available'},{i:'Export Tariff (APPC)',v:'₹3.50/unit'},{i:'TN Solar Park',v:'Allocation >1 MW'}] },
};

export const STATES = ['kerala','rajasthan','uttarakhand','uttarpradesh','tamilnadu'];
export const SL = { kerala:'Kerala', rajasthan:'Rajasthan', uttarakhand:'Uttarakhand', uttarpradesh:'Uttar Pradesh', tamilnadu:'Tamil Nadu' };

export const DEF_TNC = {
  common: `1. This proposal is valid for the period stated. Post expiry, all prices subject to revision.
2. Payment: 50% advance with order; 40% before dispatch; 10% on commissioning & handover.
3. Installation within 15 working days of 50% advance. Commissioning within 45–60 days.
4. Solar PV Modules: 10-year product warranty + 25-year linear power output warranty (min 80% at year 25).
5. Inverter: 5-year manufacturer warranty. Extended AMC packages available.
6. MMS: 5-year structural warranty on galvanization and workmanship.
7. 1-year free AMC post commissioning. Annual AMC packages available thereafter.
8. Net metering application assistance provided. DISCOM approval timelines as per DISCOM.
9. CFA/state subsidy documentation assistance. Subsidy credited directly to consumer by Govt.
10. Proposal based on standard site conditions. Additional civil/structural work quoted separately.
11. Force Majeure: Not liable for delays due to acts of God, government restrictions, or supply disruptions.
12. Disputes subject to courts at registered office. Governed by Indian law.
13. GST @ 8.9% blended (70%@5% + 30%@18%) per Govt. notification on solar equipment.
14. Contractor maintains workmen's compensation and public liability insurance during installation.
15. Binding only upon written acceptance and receipt of advance payment.`,
  kerala: `STATE TERMS – KERALA:
16. Comply with KSEB Net Metering Regulations 2014.
17. ANERT-empanelled / KSEB-approved installer required.
18. Kerala Electrical Inspector (EI) approval before grid connectivity.
19. KSEB bi-directional net meter subject to KSEB approval timeline.
20. SGST exemption on solar panels per Kerala notification.
21. PM Surya Ghar subsidy application post-commissioning. Timeline 60–90 days typically.`,
  rajasthan: `STATE TERMS – RAJASTHAN:
16. Comply with Rajasthan Solar Energy Policy 2019 and DISCOM regulations.
17. RRECL empanelment of installer required for subsidy eligibility.
18. Rajasthan Electrical Inspector clearance before DISCOM connectivity.
19. Single Window Clearance for systems above 1 MW.
20. Accelerated depreciation @80% for commercial/industrial (IT dept. approval).
21. Solar park projects comply with RRECL/RSPCL norms.`,
  uttarakhand: `STATE TERMS – UTTARAKHAND:
16. Comply with UPCL Net Metering Regulations 2016 and UERC orders.
17. UREDA empanelment required for state incentive eligibility.
18. Uttarakhand ESI certification required before energization.
19. Hill district incentive (₹5,000/kW) subject to UREDA verification.
20. Hill area structural design per IS:875 Part-4 for snow load.`,
  uttarpradesh: `STATE TERMS – UTTAR PRADESH:
16. Comply with UP Solar Policy 2022 and UPERC Net Metering Regulation 2019.
17. UPNEDA empanelment required for state capital subsidy.
18. UP Electrical Inspector approval before UPPCL connectivity.
19. State subsidy ₹15,000/kW (≤3kW residential) subject to UPNEDA verification.
20. Electricity Duty Exemption (100%, 5 years) for commercial per UP Solar Policy 2022.`,
  tamilnadu: `STATE TERMS – TAMIL NADU:
16. Comply with TNERC Net Metering Regulations 2023.
17. TEDA-empanelled / TANGEDCO-approved installer required.
18. Tamil Nadu Electrical Inspector approval before TANGEDCO connectivity.
19. CM Solar Green House Scheme subject to TEDA/TANGEDCO verification.
20. TN Solar Policy 2019 compliance required for projects above 1 kW.`,
};

export const DEF_PANELS = [
  { brand:'Adani Solar', wp:545, tech:'Mono PERC, BIS Certified, IEC 61215, Tier-1' },
  { brand:'Waaree Energies', wp:550, tech:'Mono PERC / TOPCon, BIS Certified, Tier-1' },
  { brand:'Vikram Solar', wp:545, tech:'Mono PERC SOMERA, BIS Certified, Tier-1' },
  { brand:'Tata Power Solar', wp:530, tech:'Mono PERC, BIS Certified, MNRE Approved' },
  { brand:'Goldi Solar', wp:560, tech:'TOPCon Bifacial, BIS Certified, Tier-1' },
];

export const DEF_INV = [
  { brand:'Sungrow', cap:'5–50 kW', type:'String Inverter, IP65, ≥97.5% eff., 5-yr warranty' },
  { brand:'Huawei / iSolarCloud', cap:'5–100 kW', type:'String Inverter, Smart AI, IP65, 5-yr warranty' },
  { brand:'Delta Electronics', cap:'5–30 kW', type:'String Inverter, IP65, DGMS approved, 5-yr warranty' },
  { brand:'SolarEdge', cap:'10–100 kW', type:'HD-Wave, panel-level MPPT, 12-yr warranty' },
  { brand:'Sungrow Hybrid', cap:'5–20 kW', type:'Hybrid Inverter, LiBatt compatible, IP65, 5-yr' },
];

export const DEF_BOM = [
  { cat:'A. Solar PV Modules', desc:'Solar PV Module', spec:'As per selected brand & capacity. BIS certified, IEC 61215, IEC 61730, MNRE approved, Tier-1', unit:'Nos', qb:'panel_count', sys:'all' },
  { cat:'B. Inverter', desc:'On-Grid String Inverter', spec:'As per selected brand/capacity. ≥97.5% eff., MPPT, IP65, DGMS approved, 5-yr warranty', unit:'Lot', qb:'fixed_1', sys:'ongrid' },
  { cat:'B. Inverter', desc:'Hybrid Solar Inverter (Grid + Battery)', spec:'As per selected brand. Hybrid MPPT, battery management, IP65, IEC 62109, 5-yr warranty', unit:'Lot', qb:'fixed_1', sys:'hybrid' },
  { cat:'C. Module Mounting Structure', desc:'Module Mounting Structure (MMS)', spec:'Hot-dip galvanized MS / Aluminum alloy, wind-rated 150 km/h per IS:875, adjustable tilt', unit:'Lot', qb:'fixed_1', sys:'all' },
  { cat:'D. DC Electrical', desc:'DC Cables – 6 sqmm UV Resistant Solar Cable', spec:'TÜV certified, double insulation, UV-resistant, 1500V DC, IS:694', unit:'Meters', qb:'cable_dc', sys:'all' },
  { cat:'D. DC Electrical', desc:'DC Distribution Box (DCDB) with SPD', spec:'IP65, MC4 connectors, DC MCB, SPD Class II 1000V, fuse holder', unit:'Set', qb:'fixed_1', sys:'all' },
  { cat:'E. AC Electrical & Protection', desc:'AC Cables – FRLS 4/6/10 sqmm', spec:'FRLS insulated, IS:694, color coded', unit:'Meters', qb:'cable_ac', sys:'all' },
  { cat:'E. AC Electrical & Protection', desc:'AC Distribution Box (ACDB) with RCCB & MCB', spec:'IP65, RCCB 30mA, MCB per system rating, SPD Class II', unit:'Set', qb:'fixed_1', sys:'all' },
  { cat:'E. AC Electrical & Protection', desc:'Earthing Kit (GI Pipe + Plate + Chemical)', spec:'IS:3043, GI pipe 40mm, copper bonded electrode', unit:'Nos', qb:'fixed_2', sys:'all' },
  { cat:'E. AC Electrical & Protection', desc:'Lightning Arrester with Down Conductor', spec:'Class I+II combined, IS:3043, galvanized down conductor', unit:'Set', qb:'fixed_1', sys:'all' },
  { cat:'F. Battery Bank', desc:'Lithium Battery Bank with BMS', spec:'As per selected technology (LiFePO4/NMC). Integrated BMS, 48V/96V, UL9540, 10-yr warranty', unit:'kWh', qb:'battery_kwh', sys:'hybrid' },
  { cat:'G. Metering & Monitoring', desc:'Bi-directional Net Energy Meter', spec:'DISCOM/CEIG approved, MID certified, IS:14697', unit:'No', qb:'fixed_1', sys:'all' },
  { cat:'G. Metering & Monitoring', desc:'Remote Monitoring System – Wi-Fi/GSM Data Logger', spec:'Real-time cloud dashboard, mobile app, alerts', unit:'No', qb:'fixed_1', sys:'all' },
  { cat:'H. Civil & Installation', desc:'Civil Work – Foundation & Grouting', spec:'M20 concrete, per structural drawings, GI anchor bolts', unit:'Lot', qb:'fixed_1', sys:'all' },
  { cat:'H. Civil & Installation', desc:'Installation, Cable Tray & Conduit', spec:'Skilled labour, safety PPE, MS cable tray, HDPE conduit', unit:'Lot', qb:'fixed_1', sys:'all' },
  { cat:'H. Civil & Installation', desc:'Commissioning, Testing & Handover', spec:'String test, IR test, functional test, owner training', unit:'Lot', qb:'fixed_1', sys:'all' },
  { cat:'I. Documentation & Liaison', desc:'Net Metering Application & DISCOM Liaison', spec:'SLD, DPR, DISCOM application, follow-up till net meter commissioning', unit:'Set', qb:'fixed_1', sys:'all' },
  { cat:'I. Documentation & Liaison', desc:'CFA / State Subsidy Documentation', spec:'MNRE portal registration, subsidy application, bank linkage', unit:'Set', qb:'fixed_1', sys:'all' },
];

export const DEF_SALES_EXECS = [
  { name:'Gigit', desig:'Sales Executive', phone:'', email:'' },
  { name:'Vishnu', desig:'Sales Executive', phone:'', email:'' },
  { name:'Rahoof', desig:'Sales Executive', phone:'', email:'' },
];

export const DEF_SETTINGS = { c2:30000, c3:18000, cmax:78000, crwa:18000 };

export const DEF_COMPANY = {
  name: 'Enermass Power Solutions Pvt. Ltd.',
  tag: 'Integrated Solar & Power Engineering Solutions',
  cin: 'U40100DL2015PTC283456',
  gst: '07AABCE1234F1ZV',
  pan: 'AABCE1234F',
  phone: '+91-11-45678901',
  email: 'info@enermass.in',
  web: 'www.enermass.in',
  addr: 'First Floor, AVM Complex\nChirangara Koratty Post\nThrissur, Kerala 680308',
  prefix: 'EPS',
  num: 1,
  'cp-exp': '10+ Years in Solar Energy Sector',
  'cp-proj': '500+ Solar Projects Commissioned',
  'cp-mw': '15 MW+ Aggregate Capacity',
  'cp-mnre': 'MNRE Empanelled EPC Contractor',
  'cp-biz': 'Design, Supply, Installation, Testing & Commissioning of Grid-Tied, Hybrid & Off-Grid Solar Power Systems. Net Metering Facilitation & DISCOM Liaison.',
  'cp-areas': 'Kerala, Rajasthan, Uttarakhand, Uttar Pradesh, Tamil Nadu & PAN India',
  'cp-certs': 'MNRE Empanelled, ISO 9001:2015, IEC 62109, DISCOM Approved, BIS Certified, MSME Registered',
  'cp-notes': 'Empanelled with ANERT (Kerala), RRECL (Rajasthan), UREDA (Uttarakhand), UPNEDA (UP) & TEDA (Tamil Nadu).',
  logo: null,
  sigImg: null,
  branches: {},
};
