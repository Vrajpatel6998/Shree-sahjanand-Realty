import {
  FiAward,
  FiSmile,
  FiHome,
  FiActivity,
  FiBriefcase,
  FiMap,
  FiDollarSign,
  FiKey,
  FiFileText,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiLayers,
  FiGrid,
  FiTool,
  FiShield,
  FiZap,
  FiTarget,
  FiLock
} from 'react-icons/fi';

export const siteInfo = {
  name: "Shree Sahjanand Realty",
  tagline: "Trusted Real Estate Advisor Since 2007",
  subtagline: "Helping Families and Businesses Find Their Perfect Property",
  phone: "+91 99094 21050",
  email: "info@shreesahjanandrealty.com",
  email2: "support@shreesahjanandrealty.com",
  address: "No 6, Shree Ram Park Society, Corporate House, Raspan Cross Rd, opp. Karnavati Bunglow, Nikol, Ahmedabad, Gujarat 380049",
  mapEmbedUrl: "https://maps.google.com/maps?q=No%206%2C%20Shree%20Ram%20Park%20Society%2C%20Corporate%20House%2C%20Raspan%20Cross%20Rd%2C%20opp.%20Karnavati%20Bunglow%2C%20Nikol%2C%20Ahmedabad%2C%20Gujarat%20380049&t=&z=15&ie=UTF8&iwloc=&output=embed",
  social: {
    facebook: "https://www.facebook.com/share/1GoXXCisGY/",
    instagram: "https://www.instagram.com/sahjanand_realty_1?igsh=cmRjNWx4azJuc3hx",
    twitter: "https://twitter.com/shreesahjanandrealty",
    youtube: "https://youtube.com/@shreesahjanandrealty",
    linkedin: "https://linkedin.com/company/shreesahjanandrealty",
    whatsapp: "https://wa.me/919909421050",
  },
  copyright: `© ${new Date().getFullYear()} Shree Sahjanand Realty. All Rights Reserved.`,
};

export const stats = [
  { id: 1, value: 19, suffix: "+", label: "Years Experience", icon: FiAward },
  { id: 2, value: 18000, suffix: "+", label: "Happy Clients", icon: FiSmile },
  { id: 3, value: 7000, suffix: "+", label: "Properties Sold", icon: FiHome },
  { id: 4, value: 950, suffix: "+", label: "Ongoing Projects", icon: FiActivity },
];

export const heroSlides = [
  {
    id: 1,
    image: "/assets/images/hero-1.jpg",
    headline: "Shree Sahjanand Realty",
    highlight: "Trusted Since 2007",
    subheading: "Your premier real estate consultancy in Gujarat, providing trusted residential, commercial, and land properties tailored to your needs.",
  },
  {
    id: 2,
    image: "/assets/images/hero-2.jpg",
    headline: "Premium Residential",
    highlight: "Properties",
    subheading: "Discover luxury homes and apartments designed for modern living",
  },
  {
    id: 3,
    image: "/assets/images/hero-3.jpg",
    headline: "Commercial Real Estate",
    highlight: "Solutions",
    subheading: "Find the perfect commercial space for your growing business",
  },
];

export const services = [
  {
    id: "residential",
    title: "Residential Properties",
    icon: FiHome,
    shortDesc: "Luxury homes, apartments & villas for families and individuals.",
    description: "We offer a wide range of residential properties including luxury homes, premium apartments, and villas. Our portfolio ensures you find the perfect home that matches your lifestyle, preferences, and budget.",
    features: [
      "2, 3 & 4 BHK Apartments",
      "Independent Villas & Bungalows",
      "Gated Community Projects",
      "Ready-to-Move & Under Construction",
      "RERA Approved Properties",
      "Easy Loan Assistance",
    ],
    image: "/uploads/default-residential.jpg",
    color: "#1a3c8e",
    gradient: "linear-gradient(135deg, #1a3c8e, #00b4d8)",
  },
  {
    id: "commercial",
    title: "Commercial Properties",
    icon: FiBriefcase,
    shortDesc: "Premium office spaces, shops & business centers.",
    description: "Grow your business with our premium commercial properties. From state-of-the-art office spaces to strategic retail locations, we help you find the commercial property that drives your business forward.",
    features: [
      "Office Spaces & IT Parks",
      "Retail Shops & Showrooms",
      "Business Centers & Co-working",
      "Shopping Malls & Complexes",
      "Strategic Locations",
      "High ROI Properties",
    ],
    image: "/uploads/default-commercial.jpg",
    color: "#00b4d8",
    gradient: "linear-gradient(135deg, #00b4d8, #48cae4)",
  },
  {
    id: "industrial",
    title: "Industrial Properties",
    icon: FiActivity,
    shortDesc: "Warehouses, factories & industrial plots for businesses.",
    description: "We specialize in industrial real estate including warehouses, manufacturing units, and industrial plots. Our team helps businesses secure the ideal industrial property for their operational needs.",
    features: [
      "Warehouses & Godowns",
      "Manufacturing Units",
      "Industrial Plots & Sheds",
      "Logistics Parks",
      "GIDC Approved Properties",
      "Clear Title Properties",
    ],
    image: "/uploads/default-industrial.jpg",
    color: "#0d1b4b",
    gradient: "linear-gradient(135deg, #0d1b4b, #1a3c8e)",
  },
  {
    id: "land",
    title: "Land Properties",
    icon: FiMap,
    shortDesc: "Prime agricultural, residential & commercial plots.",
    description: "Invest in land with confidence. We offer a comprehensive range of plots and land properties across prime locations for residential development, commercial use, agriculture, and investment purposes.",
    features: [
      "Residential Plots",
      "Commercial Plots",
      "Agricultural Land",
      "NA / NTP Plots",
      "Development Land",
      "Investment Opportunities",
    ],
    image: "/uploads/default-land.jpg",
    color: "#2d7a4f",
    gradient: "linear-gradient(135deg, #2d7a4f, #48cae4)",
  },
  {
    id: "loans",
    title: "Real Estate Loans",
    icon: FiDollarSign,
    shortDesc: "Home, commercial & construction loans at best rates.",
    description: "Our dedicated loan advisory team assists you in securing the best real estate financing options. We work with leading banks and financial institutions to get you the most favorable loan terms.",
    features: [
      "Home Loans",
      "Commercial Loans",
      "Construction Loans",
      "Property Loans",
      "Mortgage Loans",
      "Lowest Interest Rates",
    ],
    image: "/uploads/default-loans.jpg",
    color: "#c9a84c",
    gradient: "linear-gradient(135deg, #c9a84c, #f0d98c)",
  },
];

export const loanTypes = [
  { id: 1, icon: FiHome, title: "Home Loans", desc: "Competitive rates for your dream home up to ₹5 crores", rate: "8.5% p.a." },
  { id: 2, icon: FiBriefcase, title: "Commercial Loans", desc: "Finance your commercial property purchase seamlessly", rate: "9.0% p.a." },
  { id: 3, icon: FiActivity, title: "Construction Loans", desc: "Build your dream from ground up with easy financing", rate: "8.75% p.a." },
  { id: 4, icon: FiKey, title: "Property Loans", desc: "Loan against property for immediate financial needs", rate: "9.5% p.a." },
  { id: 5, icon: FiDollarSign, title: "Mortgage Loans", desc: "Flexible mortgage solutions with easy EMI options", rate: "8.9% p.a." },
];

export const loanProcess = [
  { step: 1, title: "Apply Online", desc: "Fill our simple inquiry form with basic details", icon: FiFileText },
  { step: 2, title: "Document Review", desc: "Our experts review your documents and eligibility", icon: FiSearch },
  { step: 3, title: "Bank Tie-up", desc: "We connect you with the best lending partners", icon: FiUsers },
  { step: 4, title: "Approval", desc: "Get loan approval within 3-7 working days", icon: FiCheckCircle },
  { step: 5, title: "Disbursement", desc: "Quick disbursement directly to your account", icon: FiTrendingUp },
];

// Interior services list removed

export const teamMembers = [
  {
    id: 1,
    name: "Rajesh Patel",
    designation: "Founder & Director",
    image: "/assets/images/team-1.jpg",
    phone: "+91 99094 21050",
    email: "rajesh@shreesahjanandrealty.com",
    experience: "19+ Years",
  },
  {
    id: 2,
    name: "Priya Sharma",
    designation: "Head of Residential Sales",
    image: "/assets/images/team-2.jpg",
    phone: "+91 99094 21050",
    email: "priya@shreesahjanandrealty.com",
    experience: "10+ Years",
  },
  {
    id: 3,
    name: "Amit Desai",
    designation: "Commercial Property Expert",
    image: "/assets/images/team-3.jpg",
    phone: "+91 99094 21050",
    email: "amit@shreesahjanandrealty.com",
    experience: "12+ Years",
  },
];

export const timeline = [
  { year: "2007", title: "Foundation", desc: "Shree Sahjanand Realty was founded with a vision to transform the real estate landscape." },
  { year: "2010", title: "First 100 Clients", desc: "Crossed the milestone of 100 happy families finding their dream homes." },
  { year: "2013", title: "Commercial Expansion", desc: "Launched commercial property division serving growing businesses." },

  { year: "2019", title: "Loan Advisory", desc: "Launched real estate loan advisory services with 20+ banking partners." },
  { year: "2022", title: "Digital Transformation", desc: "Embraced technology for better client experience and property discovery." },
  { year: "2024", title: "18000+ Clients", desc: "Celebrated serving 18000+ satisfied families and businesses." },
];

export const whyUs = [
  { icon: FiAward, title: "19+ Years Experience", desc: "Decades of expertise in real estate market across Gujarat" },
  { icon: FiUsers, title: "Trusted Network", desc: "Strong network of 50+ developers and banking partners" },
  { icon: FiShield, title: "RERA Compliant", desc: "All properties are RERA approved and legally verified" },
  { icon: FiZap, title: "Quick Processing", desc: "Fast-track property deals and loan approvals" },
  { icon: FiTarget, title: "Personalized Service", desc: "Dedicated agents for every client's unique needs" },
  { icon: FiLock, title: "Legal Assistance", desc: "Complete legal support for hassle-free transactions" },
];

export const inquiryFormOptions = {
  services: [
    "Residential Property",
    "Commercial Property",
    "Industrial Property",
    "Land Property",
    "Real Estate Loan",

  ],
  inquiryTypes: [
    "Investor",
    "Real Buyer",
  ],
  budgets: [
    "Under ₹25 Lakhs",
    "₹25 - 50 Lakhs",
    "₹50 - 75 Lakhs",
    "₹75 Lakhs - 1 Crore",
    "₹1 - 2 Crores",
    "₹2 - 5 Crores",
    "₹5 Crores+",
  ],
  occupations: [
    "Business Owner",
    "Salaried Professional",
    "Self Employed",
    "Investor",
    "NRI",
    "Student",
    "Other",
  ],
  projects: [
    "Any",
    "Aura Residency",
    "Business Square",
    "Green Valley",
    "Silver Heights",
    "Sunrise Apartments",
    "Other",
  ],
  references: [
    "Friend / Family",
    "Google Search",
    "Social Media",
    "Newspaper",
    "Hoarding / Signage",
    "Previous Client",
    "Other",
  ],
};
