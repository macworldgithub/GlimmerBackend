// scripts/seed-faq.ts
import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb+srv://ummelaila090:UigceOANgSVsmtSt@glimmer.yfdjtnb.mongodb.net/production";

const faqs = [
  {
    question: "What services do you offer?",
    answer: "We offer a wide range of salon services including makeup, haircuts, and skincare treatments.",
  },
  {
    question: "What are your opening hours?",
    answer: "We are open from 10 AM to 6 PM, Monday to Saturday.",
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us at info@glimmer.com.pk or 0331-2062376.",
  },
  {
    question: "How do I book a service?",
    answer: "Simply choose your desired service and provider, then select a convenient date/time, enter your details, and confirm the booking through our platform."
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes. Our Cancellation Policy allows changes within the specified cancellation window prior to your appointment. Please see the “Booking Work Policy” or contact support for exact timing."
  },
  {
    question: "What happens if I cancel too late?",
    answer: "If you cancel outside the allowed window, cancellation fees or penalties may apply based on the provider’s policy."
  },
  {
    question: "Do I need to pay in advance?",
    answer: "Payment is processed when booking via the selected provider. You’ll receive confirmation via email or SMS once it’s complete."
  },
  {
    question: "Can I talk to someone if I face an issue?",
    answer: "Yes. Contact us at 0331‑2062376 or info@glimmer.com.pk. Providers also receive contact information to help you directly."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We support a variety of payment methods—credit/debit cards, digital wallets, etc.—for all online orders, including those processed through salon profiles."
  },
  {
    question: "How long does shipping take?",
    answer: "Domestic delivery varies depending on product type: Products: 6–8 working days, Ready-to-wear: 7–8 working days, Custom-stitched or stitched items: up to 14 working days."
  },
  {
    question: "Is shipping free?",
    answer: "Yes, within Pakistan shipping is free. Rates for overseas delivery are calculated at checkout."
  },
  {
    question: "Can I return or cancel an order?",
    answer: "Returns: Initiate within 24 hours of delivery by emailing returns@glimmer.com.pk with your order number, name, and product details. Cancellations: Possible only within 24 hours of placing the order; after that, no changes are accepted."
  },
  {
    question: "What qualifies for exchange or refund?",
    answer: "Unused, undamaged products with tags & labels can be exchanged or refunded only if they are faulty or incorrect items. Unfortunately, fit or preference issues aren’t covered."
  },
  {
    question: "How do I track my order?",
    answer: "Use our Track My Order page to enter your order number and see the current shipping status."
  },
  {
    question: "What are the most popular products right now?",
    answer: "Our top sellers include Rose Beads Wax for sensitive skin and Goat Milk Lotion – Shea Butter, along with top-rated self-care items like Gold Beauty Cream and Sun Block Cream – all known for their quality and customer satisfaction."
  },
  {
    question: "Which products are best for sensitive skin?",
    answer: "Rose Beads Wax is gentle and ideal for delicate areas like face and bikini line. We also recommend Rice Milk Face Wash and Goat Milk Lotion, formulated specifically to hydrate without irritation."
  },
  {
    question: "Are there any organic or chemical-free options?",
    answer: "Yes! We offer a curated line of self-care products that are sulphate‑ and paraben‑free, including Rice Milk Face Wash and several lotions and creams."
  },
  {
    question: "What product is best for SPF protection?",
    answer: "Our Sun Block Cream is a popular pick, offering broad-spectrum protection and formulated without harsh chemicals."
  },
  {
    question: "Can you recommend a hydrating product for dry skin?",
    answer: "Shea Butter Goat Milk Lotion is deeply moisturizing and perfect for dry or rough skin, leaving it soft and nourished."
  },
  {
    question: "Do you have any salon-friendly products for home use?",
    answer: "Absolutely. We stock professional-grade items like Gold Beauty Cream and Rose Beads Wax, often used in salons and now available for home care."
  },
  {
    question: "What makes Rose Beads Wax stand out?",
    answer: "It’s specially formulated for sensitive skin, offering gentle but effective hair removal on delicate areas. Many customers report fewer nicks and less redness compared to standard waxes."
  },
  {
    question: "How do I know which product suits me best?",
    answer: "Sensitive skin: Try Rose Beads Wax, Rice Milk Face Wash, Goat Milk Lotion. Dry skin: Choose Shea Butter Goat Milk Lotion. Sun protection: Use our Sun Block Cream. Salon-like glow: Opt for Gold Beauty Cream."
  },
  {
    question: "Are featured products available across Pakistan?",
    answer: "Yes, all our recommended best‑sellers are available for delivery across Pakistan, with estimated shipping times of 6–8 working days domestic, and longer for custom/pret items."
  },
  {
    question: "Can I return a product if I’m not satisfied?",
    answer: "Yes! All products are covered under our standard return policy—unused, in original packaging within the return window. See the “Shipping & Returns” page for details."
  }
];

async function seedFAQ() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db("production");
  const collection = db.collection("faq");

  await collection.deleteMany({});
  await collection.insertMany(faqs);

  console.log("FAQ seeded successfully.");
  await client.close();
}

seedFAQ();
