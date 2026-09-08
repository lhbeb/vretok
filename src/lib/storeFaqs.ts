export interface StoreFaq {
  question: string;
  answer: string;
  linkHref?: string;
  linkLabel?: string;
}
export const STORE_FAQS: readonly StoreFaq[] = [
  { question: 'What is Vretok?', answer: 'Vretok is a performance activewear brand focused on leggings, matching sets, gym tops, and modern training style.' },
  { question: 'How do I choose the right leggings?', answer: 'Compare the size guide, rise, length, compression, fabric, and intended activity shown on each product page. Contact our team if you need help finding your fit.', linkHref: '/contact', linkLabel: 'Ask about fit' },
  { question: 'Are tops and accessories included?', answer: 'Each listing states exactly what is included. Matching pieces may be sold separately unless the product is described as a set.' },
  { question: 'How do I place an order?', answer: 'Choose your item, add it to your cart, and proceed to checkout. Review your delivery details and payment information before completing your order.' },
  { question: 'Where can I find delivery information?', answer: 'See our shipping policy for delivery coverage, dispatch details, and timelines.', linkHref: '/shipping-policy', linkLabel: 'Read the shipping policy' },
  { question: 'How do I track my order?', answer: 'Use the Track Order page to check your order status.', linkHref: '/track', linkLabel: 'Track your order' },
  { question: 'What is the return policy?', answer: 'Review the return policy for eligibility, time limits, and instructions before requesting a return.', linkHref: '/return-policy', linkLabel: 'Read the return policy' },
  { question: 'How can I contact Vretok?', answer: 'Use our contact page for product questions and order support.', linkHref: '/contact', linkLabel: 'Contact our team' },
];
