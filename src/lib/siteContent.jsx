export const QUIZ_URL = "https://quiz.accidentcompensationhelper.com/s/eval";

export const SITE = {
  name: "Accident Compensation Helper",
  domain: "accidentcompensationhelper.com",
  email: "support@accidentcompensationhelper.com",
};

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Accident Types", to: "/accident-types" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export const ACCIDENT_TYPES = [
  { slug: "auto-accidents", title: "Auto Accidents", icon: "Car", blurb: "Rear-end, intersection, highway and multi-vehicle collisions." },
  { slug: "truck-accidents", title: "Truck Accidents", icon: "Truck", blurb: "Collisions involving commercial semi and delivery trucks." },
  { slug: "motorcycle-accidents", title: "Motorcycle Accidents", icon: "Bike", blurb: "Serious injuries from motorcycle crashes and right-of-way failures." },
  { slug: "slip-and-fall", title: "Slip and Fall", icon: "PersonStanding", blurb: "Premises liability for unsafe floors, stairs and walkways." },
  { slug: "workplace-injury", title: "Workplace Injury", icon: "HardHat", blurb: "On-the-job injuries beyond standard workers' comp claims." },
  { slug: "pedestrian-accidents", title: "Pedestrian Accidents", icon: "Footprints", blurb: "Crosswalk and roadside injuries involving pedestrians." },
  { slug: "rideshare-accidents", title: "Rideshare Accidents", icon: "Car", blurb: "Uber, Lyft and other rideshare collision claims." },
  { slug: "wrongful-death", title: "Wrongful Death", icon: "Scale", blurb: "Claims for families who have lost a loved one to negligence." },
];

export const STEPS = [
  { n: 1, title: "Answer a few questions", body: "Tell us what happened in a quick, confidential claim check. It takes about two minutes." },
  { n: 2, title: "Get an instant read", body: "We review the details of your situation and help you understand whether it may be worth pursuing." },
  { n: 3, title: "Connect if you choose", body: "If you qualify, you can request a free, no-obligation conversation with a participating attorney." },
];

export const FAQS = [
  { q: "Is this really free?", a: "Yes. The claim check is completely free and confidential. There is no obligation to move forward." },
  { q: "Are you a law firm?", a: "No. Accident Compensation Helper is not a law firm and does not provide legal advice. If you qualify, we can help you request contact with a participating attorney." },
  { q: "How long does it take?", a: "The claim check takes about two minutes. You answer a few questions about what happened and get an immediate read." },
  { q: "Will my information be shared?", a: "Your answers are kept confidential. We only share details with a participating attorney if you choose to request contact." },
  { q: "What kinds of accidents qualify?", a: "Auto, truck, motorcycle, slip and fall, workplace, pedestrian, rideshare and other injury accidents may qualify. Start the check to find out." },
];

export const TRUST_POINTS = [
  { icon: "Clock", title: "Takes 2 minutes", body: "A quick claim check, not a long intake form." },
  { icon: "ShieldCheck", title: "Free and confidential", body: "No cost and no obligation, ever." },
  { icon: "Lock", title: "Handled securely", body: "Your information is protected and private." },
  { icon: "Scale", title: "Attorney ready", body: "Connect with a participating attorney if you qualify." },
];

/**
 * Facts about how the service operates. Deliberately no claim counts,
 * settlement figures or star ratings: we cannot substantiate those, and
 * unverifiable outcome claims are exactly what draws regulatory attention
 * in this category.
 */
export const STATS = [
  { value: "2 min", label: "typical time to complete" },
  { value: "50 states", label: "claim checks accepted" },
  { value: "$0", label: "cost to use" },
  { value: "24/7", label: "start whenever you like" },
];