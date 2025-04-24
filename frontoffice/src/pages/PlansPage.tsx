import React, { useState } from "react"; // ✅ Needed for useState
import { Check, X, Star, ChevronRight } from "lucide-react"; // ✅ Added ChevronRight
import { Link } from "react-router-dom";

const PlansPage: React.FC = () => { // ✅ Corrected component declaration
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const plans = [
    {
      name: "Solo Entrepreneur",
      price: "Free",
      period: "Lifetime Access",
      originalPrice: "TND550",
      features: [
        { name: "1 Business Account", available: true },
        { name: "1 User Access", available: true },
        { name: "Sales Invoicing", available: true },
        { name: "Purchase Invoicing", available: true },
        { name: "Inventory Management", available: true },
        { name: "Multi-warehouse Support", available: true },
        { name: "Serial Number Tracking", available: true },
        { name: "Client Management", available: true },
        { name: "Supplier Management", available: true },
        { name: "Cash Flow Management", available: true },
        { name: "POS System", available: true },
        { name: "Detailed Reports", available: true },
        { name: "Advanced Dashboard", available: true },
      ],
      additionalFeatures: [
        { name: "10 Invoices per month", highlight: true },
        { name: "Duplicate Documents", highlight: true },
        { name: "Multi-currency", highlight: true },
        { name: "Data Export", highlight: true },
        { name: "SMS Payment Reminders", highlight: true },
        { name: "Integrated Signature", highlight: true },
        { name: "File Attachments", highlight: true },
        { name: "Premium Support", highlight: false },
      ],
      tag: "FREE",
      tagColor: "bg-blue-500",
    },
    {
      name: "Kanz Economic",
      price: "450",
      period: "Annually",
      currency: "TND",
      unit: "Excl. Tax",
      features: [
        { name: "1 Business Account", available: true },
        { name: "1 User Access", available: true },
        { name: "Sales Invoicing", available: true },
        { name: "Purchase Invoicing", available: true },
        { name: "Inventory Management", available: true },
        { name: "Multi-warehouse Support", available: true },
        { name: "Serial Number Tracking", available: true },
        { name: "Client Management", available: true },
        { name: "Supplier Management", available: true },
        { name: "Cash Flow Management", available: true },
        { name: "POS System", available: true },
        { name: "Detailed Reports", available: true },
        { name: "Advanced Dashboard", available: true },
      ],
      additionalFeatures: [
        { name: "50 Documents per month", highlight: true },
        { name: "Duplicate Documents", highlight: true },
        { name: "Multi-currency", highlight: true },
        { name: "Data Export", highlight: true },
        { name: "SMS Payment Reminders", highlight: true },
        { name: "Integrated Signature", highlight: true },
        { name: "File Attachments", highlight: true },
        { name: "Premium Support", highlight: false },
      ],
      tag: "ECONOMIC",
      tagColor: "bg-blue-500",
    },
    {
      name: "Kanz Premium",
      price: "600",
      period: "Annually",
      currency: "TND",
      unit: "Excl. Tax",
      features: [
        { name: "1 Business Account", available: true },
        { name: "3 User Access", available: true },
        { name: "Sales Invoicing", available: true },
        { name: "Purchase Invoicing", available: true },
        { name: "Inventory Management", available: true },
        { name: "Advanced Multi-warehouse", available: true },
        { name: "Serial Number Tracking", available: true },
        { name: "Client Management", available: true },
        { name: "Supplier Management", available: true },
        { name: "Cash Flow Management", available: true },
        { name: "POS System", available: true },
        { name: "Detailed Reports", available: true },
        { name: "Advanced Dashboard", available: true },
      ],
      additionalFeatures: [
        { name: "Unlimited Documents", highlight: true },
        { name: "Duplicate Documents", highlight: true },
        { name: "Multi-currency", highlight: true },
        { name: "Data Import & Export", highlight: true },
        { name: "SMS Payment Reminders", highlight: true },
        { name: "Integrated Signature", highlight: true },
        { name: "File Attachments", highlight: true },
        { name: "Premium Support", highlight: true },
      ],
      tag: "POPULAR",
      tagColor: "bg-green-500",
    },
    {
      name: "Kanz VIP",
      price: "7000",
      period: "Lifetime Access",
      currency: "TND",
      unit: "",
      features: [
        { name: "1 Business Account", available: true },
        { name: "Unlimited Users", available: true },
        { name: "Sales Invoicing", available: true },
        { name: "Purchase Invoicing", available: true },
        { name: "Inventory Management", available: true },
        { name: "Advanced Multi-warehouse", available: true },
        { name: "Serial Number Tracking", available: true },
        { name: "Client Management", available: true },
        { name: "Supplier Management", available: true },
        { name: "Cash Flow Management", available: true },
        { name: "POS System", available: true },
        { name: "Detailed Reports", available: true },
        { name: "Advanced Dashboard", available: true },
      ],
      additionalFeatures: [
        { name: "Unlimited Documents", highlight: true },
        { name: "Duplicate Documents", highlight: true },
        { name: "Multi-currency", highlight: true },
        { name: "Data Import & Export", highlight: true },
        { name: "SMS Payment Reminders", highlight: true },
        { name: "Integrated Signature", highlight: true },
        { name: "File Attachments", highlight: true },
        { name: "Premium Support", highlight: true },
      ],
      tag: "BEST VALUE",
      tagColor: "bg-purple-600",
    }
  ];
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Pourquoi devrais-je choisir Swiver plutôt que d'autres solutions ?",
      answer: "Swiver se distingue par sa solution SaaS sécurisée et intuitive, offrant des fonctionnalités complètes de gestion financière et commerciale adaptées aux petites entreprises. Notre plateforme garantit la sécurité des données, la facilité d'utilisation et une efficacité inégalée par rapport aux autres alternatives."
    },
    {
      question: "Comment Swiver m'économise-t-il du temps et de l'argent ?",
      answer: "Swiver automatise vos processus financiers et commerciaux, réduisant le temps consacré aux tâches administratives. Notre solution abordable élimine le besoin de multiples logiciels coûteux, tout en optimisant votre productivité quotidienne."
    },
    {
      question: "Swiver convient-il à mon secteur d'activité spécifique ?",
      answer: "Oui, Swiver est conçu pour s'adapter à une large gamme de secteurs d'activité. Notre plateforme offre une flexibilité permettant de personnaliser les fonctionnalités selon vos besoins spécifiques, que vous soyez dans le commerce, les services, l'artisanat ou tout autre domaine."
    },
    {
      question: "Puis-je faire confiance à Swiver avec mes données sensibles ?",
      answer: "Absolument. La sécurité des données est notre priorité absolue. Nous utilisons des technologies de cryptage avancées, des sauvegardes régulières et des protocoles de protection rigoureux pour garantir que vos informations restent confidentielles et protégées à tout moment."
    },
    {
      question: "À quel point Swiver Lite est-il convivial pour les micro-entrepreneurs ?",
      answer: "Swiver Lite est spécialement conçu pour les micro-entrepreneurs avec une interface simplifiée et des fonctionnalités essentielles. Il offre un excellent rapport qualité-prix avec une prise en main rapide, idéal pour ceux qui débutent ou gèrent une petite structure."
    },
    {
      question: "Puis-je gérer mon entreprise en déplacement avec Swiver ?",
      answer: "Oui, Swiver est entièrement accessible sur mobile et tablette. Notre application responsive vous permet de gérer vos factures, suivre vos paiements et accéder à vos données commerciales importantes, où que vous soyez et à tout moment."
    },
    {
      question: "Comment Swiver soutient-il la collaboration entre les membres de l'équipe ?",
      answer: "Swiver offre des fonctionnalités de collaboration permettant à plusieurs utilisateurs de travailler simultanément. Vous pouvez attribuer différents niveaux d'accès, partager des documents, assigner des tâches et communiquer efficacement au sein de la plateforme."
    },
    {
      question: "Le support client est-il disponible quand j'ai besoin d'aide ?",
      answer: "Notre équipe de support est disponible par chat, email et téléphone pendant les heures ouvrables. Les clients Premium bénéficient d'un support prioritaire et d'un temps de réponse accéléré pour résoudre rapidement tout problème rencontré."
    },
    {
      question: "Que se passe-t-il si je dois annuler mon abonnement ?",
      answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Nous n'imposons pas de période d'engagement minimum. À la fin de votre période de facturation, vous aurez la possibilité d'exporter toutes vos données dans un format standard."
    }
  ];


  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Trust Section */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Over <strong className="text-gray-900">14,000</strong> satisfied clients
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              <strong className="text-gray-900">15-day</strong> free trial – No commitment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Not happy? <strong className="text-gray-900">Refund within 90 days</strong>
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Plans
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your business
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className="relative border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition duration-300">
              
              {plan.tag && (
                <div className={`${plan.tagColor} text-white text-xs font-bold py-1 px-3 absolute -right-8 top-6 rotate-45 w-32 text-center`}>
                  {plan.tag}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  {plan.price === "Free" ? (
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-500 mr-1">{plan.currency}</span>
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      {plan.unit && (
                        <span className="text-sm font-medium text-gray-500 ml-1">{plan.unit}</span>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{plan.period}</p>
                {plan.originalPrice && (
                  <p className="mt-1 text-sm text-gray-500 line-through">{plan.originalPrice}</p>
                )}
              </div>

              <div className="px-6 pb-8 bg-gray-50">
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-700">
                      {feature.available ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="ml-3">{feature.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 my-4"></div>
                <ul className="space-y-3">
                  {plan.additionalFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-700">
                      {feature.highlight ? (
                        <Star className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="ml-3">{feature.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    to="/signup"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
      
   {/* FAQ Section */}
   <section className="py-16 bg-light-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">FAQ</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-6">
                <button 
                  className="flex w-full items-center justify-between rounded-lg bg-white p-6 text-left shadow-sm hover:bg-gray-50"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <ChevronRight 
                    className={`h-5 w-5 text-gray-400 transition-transform ${openIndex === index ? "rotate-90" : ""}`} 
                  />
                </button>
                {openIndex === index && (
                  <div className="mt-2 px-6 py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>


  );
}
export default PlansPage;