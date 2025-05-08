import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Accordion from '../ui/Accordion';

const FAQ: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const faqItems = [
    {
      question: "What happens after the 15-day trial?",
      answer: "After your 15-day free trial ends, your account will automatically switch to the plan you selected. You can downgrade, upgrade, or cancel at any time from your account settings. We'll send you a reminder email 3 days before your trial ends.",
    },
    {
      question: "Do I need to enter my card details for the trial?",
      answer: "No, you don't need to provide any payment information to start your 15-day free trial. We believe you should be able to fully experience Kanz before making a commitment.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel during your trial period, you won't be charged. If you cancel after being billed, you'll have access until the end of your billing cycle with no refunds for partial months.",
    },
    {
      question: "How secure is my data with Kanz?",
      answer: "We take security seriously. Kanz uses bank-level encryption (256-bit SSL) to protect your data, both in transit and at rest. We perform regular security audits and comply with industry standards. Your financial data is never shared with third parties without your explicit permission.",
    },
    {
      question: "Can I import data from other accounting software?",
      answer: "Yes, Kanz supports importing data from popular accounting platforms like QuickBooks, Xero, and FreshBooks. Our import tool helps you migrate your chart of accounts, contacts, and transaction history with minimal effort.",
    },
    {
      question: "Is there a limit to the number of transactions?",
      answer: "The Basic plan limits you to 100 transactions per month. The Pro plan offers unlimited transactions, making it ideal for businesses with higher volume needs.",
    },
  ];
  
  return (
    <section id="faq" className="section" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-lg mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="subtitle mx-auto">
            Have questions about Kanz? We've got answers. If you can't find what you're looking for, feel free to contact our support team.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <Accordion
              key={index}
              question={item.question}
              answer={item.answer}
              delay={0.2 + index * 0.1}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;