// ============================================
// SHREE SAHJANAND REALTY — SITE DATA (JSON)
// Placeholder data — ready for API/backend
// ============================================

export const siteInfo = {
  name: "Shree Sahjanand Realty",
  tagline: "Trusted Real Estate Partner Since 2007",
  subtagline: "Helping Families and Businesses Find Their Perfect Property",
  phone: "+91 98765 43210",
  phone2: "+91 98765 43211",
  email: "info@shreesahjanandrealty.com",
  email2: "support@shreesahjanandrealty.com",
  address: "123, Business Hub, Near Sardar Patel Stadium, Navrangpura, Ahmedabad - 380009, Gujarat",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9018!2d72.5713!3d23.0225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848abad45ebd!2sAhmedabad!5e0!3m2!1sen!2sin!4v1700000000000",
  social: {
    facebook: "https://facebook.com/shreesahjanandrealty",
    instagram: "https://instagram.com/shreesahjanandrealty",
    twitter: "https://twitter.com/shreesahjanandrealty",
    youtube: "https://youtube.com/@shreesahjanandrealty",
    linkedin: "https://linkedin.com/company/shreesahjanandrealty",
    whatsapp: "https://wa.me/919876543210",
  },
  copyright: `© ${new Date().getFullYear()} Shree Sahjanand Realty. All Rights Reserved.`,
};

export const stats = [
  { id: 1, value: 18, suffix: "+", label: "Years Experience", icon: "🏆" },
  { id: 2, value: 1000, suffix: "+", label: "Happy Clients", icon: "😊" },
  { id: 3, value: 500, suffix: "+", label: "Properties Sold", icon: "🏡" },
  { id: 4, value: 100, suffix: "+", label: "Ongoing Projects", icon: "🏗️" },
];

export const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    headline: "Your Trusted Real Estate Partner",
    highlight: "Since 2007",
    subheading: "Helping Families and Businesses Find Their Perfect Property",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80",
    headline: "Premium Residential",
    highlight: "Properties",
    subheading: "Discover luxury homes and apartments designed for modern living",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
    headline: "Commercial Real Estate",
    highlight: "Solutions",
    subheading: "Find the perfect commercial space for your growing business",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f28f958f?w=1920&q=80",
    headline: "Interior Design",
    highlight: "Excellence",
    subheading: "Transform your space into a masterpiece with our design experts",
  },
];

export const services = [
  {
    id: "residential",
    title: "Residential Properties",
    icon: "🏠",
    shortDesc: "Luxury homes, apartments & villas for families and individuals.",
    description: "We offer a wide range of residential properties including luxury homes, premium apartments, and villas. Our extensive portfolio ensures you find the perfect home that matches your lifestyle, preferences, and budget.",
    features: [
      "2, 3 & 4 BHK Apartments",
      "Independent Villas & Bungalows",
      "Gated Community Projects",
      "Ready-to-Move & Under Construction",
      "RERA Approved Properties",
      "Easy Loan Assistance",
    ],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    color: "#1a3c8e",
    gradient: "linear-gradient(135deg, #1a3c8e, #00b4d8)",
  },
  {
    id: "commercial",
    title: "Commercial Properties",
    icon: "🏢",
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
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    color: "#00b4d8",
    gradient: "linear-gradient(135deg, #00b4d8, #48cae4)",
  },
  {
    id: "industrial",
    title: "Industrial Properties",
    icon: "🏭",
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
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    color: "#0d1b4b",
    gradient: "linear-gradient(135deg, #0d1b4b, #1a3c8e)",
  },
  {
    id: "land",
    title: "Land Properties",
    icon: "🌳",
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
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    color: "#2d7a4f",
    gradient: "linear-gradient(135deg, #2d7a4f, #48cae4)",
  },
  {
    id: "loans",
    title: "Real Estate Loans",
    icon: "🏦",
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
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    color: "#c9a84c",
    gradient: "linear-gradient(135deg, #c9a84c, #f0d98c)",
  },
  {
    id: "interior",
    title: "Interior Solutions",
    icon: "🛋️",
    shortDesc: "Premium interior design for homes, offices & commercial spaces.",
    description: "Transform your property into a stunning masterpiece with our interior design services. Our expert designers create personalized spaces that reflect your style while maximizing functionality and aesthetics.",
    features: [
      "Residential Interiors",
      "Commercial Interiors",
      "Office Interiors",
      "Space Planning",
      "Renovation Services",
      "3D Design Visualization",
    ],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #00b4d8)",
  },
];

export const loanTypes = [
  { id: 1, icon: "🏠", title: "Home Loans", desc: "Competitive rates for your dream home up to ₹5 crores", rate: "8.5% p.a." },
  { id: 2, icon: "🏢", title: "Commercial Loans", desc: "Finance your commercial property purchase seamlessly", rate: "9.0% p.a." },
  { id: 3, icon: "🏗️", title: "Construction Loans", desc: "Build your dream from ground up with easy financing", rate: "8.75% p.a." },
  { id: 4, icon: "🔑", title: "Property Loans", desc: "Loan against property for immediate financial needs", rate: "9.5% p.a." },
  { id: 5, icon: "🏦", title: "Mortgage Loans", desc: "Flexible mortgage solutions with easy EMI options", rate: "8.9% p.a." },
];

export const loanProcess = [
  { step: 1, title: "Apply Online", desc: "Fill our simple inquiry form with basic details", icon: "📝" },
  { step: 2, title: "Document Review", desc: "Our experts review your documents and eligibility", icon: "🔍" },
  { step: 3, title: "Bank Tie-up", desc: "We connect you with the best lending partners", icon: "🤝" },
  { step: 4, title: "Approval", desc: "Get loan approval within 3-7 working days", icon: "✅" },
  { step: 5, title: "Disbursement", desc: "Quick disbursement directly to your account", icon: "💰" },
];

export const interiorServices = [
  {
    id: 1,
    title: "Residential Interiors",
    desc: "Transform your home into a luxurious sanctuary",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=600&q=80",
    icon: "🛋️",
  },
  {
    id: 2,
    title: "Commercial Interiors",
    desc: "Create impressive spaces that inspire business",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    icon: "🏢",
  },
  {
    id: 3,
    title: "Office Interiors",
    desc: "Productive workspaces designed for success",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80",
    icon: "💼",
  },
  {
    id: 4,
    title: "Space Planning",
    desc: "Optimize every square foot with smart design",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    icon: "📐",
  },
  {
    id: 5,
    title: "Renovation Services",
    desc: "Breathe new life into existing spaces",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    icon: "🔨",
  },
];

export const teamMembers = [
  {
    id: 1,
    name: "Rajesh Patel",
    designation: "Founder & Director",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    phone: "+91 98765 43210",
    email: "rajesh@shreesahjanandrealty.com",
    experience: "18+ Years",
  },
  {
    id: 2,
    name: "Priya Sharma",
    designation: "Head of Residential Sales",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    phone: "+91 98765 43211",
    email: "priya@shreesahjanandrealty.com",
    experience: "10+ Years",
  },
  {
    id: 3,
    name: "Amit Desai",
    designation: "Commercial Property Expert",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    phone: "+91 98765 43212",
    email: "amit@shreesahjanandrealty.com",
    experience: "12+ Years",
  },
  {
    id: 4,
    name: "Sneha Mehta",
    designation: "Interior Design Lead",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    phone: "+91 98765 43213",
    email: "sneha@shreesahjanandrealty.com",
    experience: "8+ Years",
  },
];

export const timeline = [
  { year: "2007", title: "Foundation", desc: "Shree Sahjanand Realty was founded with a vision to transform the real estate landscape." },
  { year: "2010", title: "First 100 Clients", desc: "Crossed the milestone of 100 happy families finding their dream homes." },
  { year: "2013", title: "Commercial Expansion", desc: "Launched commercial property division serving growing businesses." },
  { year: "2016", title: "Interior Division", desc: "Added premium interior design services to our portfolio." },
  { year: "2019", title: "Loan Advisory", desc: "Launched real estate loan advisory services with 20+ banking partners." },
  { year: "2022", title: "Digital Transformation", desc: "Embraced technology for better client experience and property discovery." },
  { year: "2024", title: "1000+ Clients", desc: "Celebrated serving 1000+ satisfied families and businesses." },
];

export const whyUs = [
  { icon: "🏆", title: "18+ Years Experience", desc: "Decades of expertise in real estate market across Gujarat" },
  { icon: "🤝", title: "Trusted Network", desc: "Strong network of 50+ developers and banking partners" },
  { icon: "💯", title: "RERA Compliant", desc: "All properties are RERA approved and legally verified" },
  { icon: "⚡", title: "Quick Processing", desc: "Fast-track property deals and loan approvals" },
  { icon: "🎯", title: "Personalized Service", desc: "Dedicated agents for every client's unique needs" },
  { icon: "🔐", title: "Legal Assistance", desc: "Complete legal support for hassle-free transactions" },
];

export const inquiryFormOptions = {
  services: [
    "Residential Property",
    "Commercial Property",
    "Industrial Property",
    "Land Property",
    "Real Estate Loan",
    "Interior Solution",
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
