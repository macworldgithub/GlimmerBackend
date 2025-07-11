import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production";

function normalize(texts: string[]) {
  return texts
    .flatMap((text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, "")
        .split(/\s+/)
    )
    .filter(Boolean);
}

const faqs = [
  {
    question: "What services do you offer?",
    answer: "We offer a wide range of salon services including makeup, haircuts, and skincare treatments.",
    keywords: normalize(["services", "what can I book", "salon services", "available treatments", "makeup and hair"])
  },
  {
    question: "What are your opening hours?",
    answer: "We are open from 10 AM to 6 PM, Monday to Saturday.",
    keywords: normalize(["timing", "hours", "when are you open", "working hours", "business hours", "opening hours"])
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us at info@glimmer.com.pk or 0331-2062376.",
    keywords: normalize(["contact", "phone number", "email", "how to reach", "talk to support"])
  },
  {
    question: "How do I book a service?",
    answer: "Simply choose your desired service and provider, then select a convenient date/time, enter your details, and confirm the booking through our platform.",
    keywords: normalize(["book appointment", "book service", "how to book", "make a booking", "appointment process"])
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes. Our Cancellation Policy allows changes within the specified cancellation window prior to your appointment. Please see the “Booking Work Policy” or contact support for exact timing.",
    keywords: normalize([
      "cancel booking",
      "reschedule",
      "how to cancel",
      "how to reschedule",
      "change my booking"
    ])
  },
  {
    question: "What happens if I cancel too late?",
    answer: "If you cancel outside the allowed window, cancellation fees or penalties may apply based on the provider’s policy.",
    keywords: normalize(["late cancellation", "cancellation fees", "penalty for cancel", "cancel too late", "cancel order", "order"])
  },
  {
    question: "Do I need to pay in advance?",
    answer: "Payment is processed when booking via the selected provider. You’ll receive confirmation via email or SMS once it’s complete.",
    keywords: normalize(["advance payment", "pay before booking", "when do I pay", "payment time"])
  },
  {
    question: "Can I talk to someone if I face an issue?",
    answer: "Yes. Contact us at 0331‑2062376 or info@glimmer.com.pk. Providers also receive contact information to help you directly.",
    keywords: normalize(["talk to support", "speak to agent", "contact someone", "need help", "talk to human"])
  },
  {
    question: "What payment methods are accepted?",
    answer: "We support a variety of payment methods—credit/debit cards, digital wallets, etc.—for all online orders, including those processed through salon profiles.",
    keywords: normalize(["payment methods", "how to pay", "payment options", "card or wallet", "accepted payment"])
  },
  {
    question: "How long does shipping take?",
    answer: "Domestic delivery varies depending on product type: Products: 6–8 working days, Ready-to-wear: 7–8 working days, Custom-stitched or stitched items: up to 14 working days.",
    keywords: normalize(["shipping time", "delivery duration", "how many days", "when will I get", "shipping estimate"])
  },
  {
    question: "Is shipping free?",
    answer: "Yes, within Pakistan shipping is free. Rates for overseas delivery are calculated at checkout.",
    keywords: normalize(["free shipping", "shipping charges", "delivery cost", "is delivery free"])
  },
  {
    question: "Can I return or cancel an order?",
    answer: "Returns: Initiate within 24 hours of delivery by emailing returns@glimmer.com.pk with your order number, name, and product details. Cancellations: Possible only within 24 hours of placing the order; after that, no changes are accepted.",
    keywords: normalize(["return order", "cancel order", "how to return", "cancel my order", "order return process"])
  },
  {
    question: "What qualifies for exchange or refund?",
    answer: "Unused, undamaged products with tags & labels can be exchanged or refunded only if they are faulty or incorrect items. Unfortunately, fit or preference issues aren’t covered.",
    keywords: normalize(["exchange", "refund", "return policy", "get money back", "replace item"])
  },
  {
    question: "How do I track my order?",
    answer: "Use our Track My Order page to enter your order number and see the current shipping status.",
    keywords: normalize(["track order", "order tracking", "check delivery status", "where is my order"])
  },
  {
    question: "What are the most popular products right now?",
    answer: "Our top sellers include Rose Beads Wax for sensitive skin and Goat Milk Lotion – Shea Butter, along with top-rated self-care items like Gold Beauty Cream and Sun Block Cream – all known for their quality and customer satisfaction.",
    keywords: normalize(["top products", "popular items", "best sellers", "trending products"])
  },
  {
    question: "Which products are best for sensitive skin?",
    answer: "Rose Beads Wax is gentle and ideal for delicate areas like face and bikini line. We also recommend Rice Milk Face Wash and Goat Milk Lotion, formulated specifically to hydrate without irritation.",
    keywords: normalize(["sensitive skin", "gentle products", "best for sensitive", "mild face wash"])
  },
  {
    question: "Are there any organic or chemical-free options?",
    answer: "Yes! We offer a curated line of self-care products that are sulphate‑ and paraben‑free, including Rice Milk Face Wash and several lotions and creams.",
    keywords: normalize(["organic", "chemical free", "natural products", "no parabens", "sulphate free"])
  },
  {
    question: "What product is best for SPF protection?",
    answer: "Our Sun Block Cream is a popular pick, offering broad-spectrum protection and formulated without harsh chemicals.",
    keywords: normalize(["SPF", "sun protection", "sunblock", "uv protection", "best sunscreen"])
  },
  {
    question: "Can you recommend a hydrating product for dry skin?",
    answer: "Shea Butter Goat Milk Lotion is deeply moisturizing and perfect for dry or rough skin, leaving it soft and nourished.",
    keywords: normalize(["dry skin", "hydrating lotion", "moisturizer", "body lotion", "goat milk lotion"])
  },
  {
    question: "Do you have any salon-friendly products for home use?",
    answer: "Absolutely. We stock professional-grade items like Gold Beauty Cream and Rose Beads Wax, often used in salons and now available for home care.",
    keywords: normalize(["salon products at home", "use at home", "professional items", "salon quality"])
  },
  {
    question: "What makes Rose Beads Wax stand out?",
    answer: "It’s specially formulated for sensitive skin, offering gentle but effective hair removal on delicate areas. Many customers report fewer nicks and less redness compared to standard waxes.",
    keywords: normalize(["rose wax", "best wax", "gentle wax", "wax for sensitive skin"])
  },
  {
    question: "How do I know which product suits me best?",
    answer: "Sensitive skin: Try Rose Beads Wax, Rice Milk Face Wash, Goat Milk Lotion. Dry skin: Choose Shea Butter Goat Milk Lotion. Sun protection: Use our Sun Block Cream. Salon-like glow: Opt for Gold Beauty Cream.",
    keywords: normalize(["which product is best", "recommend product", "what should I buy", "product for skin type"])
  },
  {
    question: "Are featured products available across Pakistan?",
    answer: "Yes, all our recommended best‑sellers are available for delivery across Pakistan, with estimated shipping times of 6–8 working days domestic, and longer for custom/pret items.",
    keywords: normalize(["available in Pakistan", "can I order nationwide", "deliver anywhere"])
  },
  {
    question: "Can I return a product if I’m not satisfied?",
    answer: "Yes! All products are covered under our standard return policy—unused, in original packaging within the return window. See the “Shipping & Returns” page for details.",
    keywords: normalize(["return product", "not satisfied", "return if bad", "product return policy"])
  }
];

async function seedFAQ() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db("production");
  const collection = db.collection("faqs");

  await collection.deleteMany({});
  await collection.insertMany(faqs);

  console.log("FAQ seeded successfully.");
  await client.close();
}

seedFAQ();
