import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ClipboardList, 
  Users, 
  Calendar, 
  CreditCard, 
  BarChart, 
  ChevronRight
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import ClientCard from '../components/ClientCard';

const HomePage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const services = [
    {
      title: 'Invoice Management',
      description: 'View and manage all your invoices in one place, with real-time payment status updates.',
      icon: FileText,
    },
    {
      title: 'Quote Requests',
      description: 'Request and track service quotes with our easy-to-use online form system.',
      icon: ClipboardList,
    },
    {
      title: 'Client Portal',
      description: 'Access all your important documents and communications through our secure client area.',
      icon: Users,
    },
    {
      title: 'Appointment Scheduling',
      description: 'Schedule and manage appointments with our integrated calendar system.',
      icon: Calendar,
    },
    {
      title: 'Online Payments',
      description: 'Securely pay invoices online with our integrated payment processing system.',
      icon: CreditCard,
    },
    {
      title: 'Business Analytics',
      description: 'Get insights into your business with our comprehensive reporting tools.',
      icon: BarChart,
    },
  ];

  const testimonials = [
    {
      quote: "BusinessPortal has completely transformed how we manage client relationships. The platform is intuitive and has saved us countless hours.",
      author: "Sarah Johnson",
      company: "Design Studio Inc.",
      image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      quote: "The client dashboard is brilliant. Our customers love being able to access their invoices and quotes in one place.",
      author: "Michael Rodriguez",
      company: "Tech Solutions Ltd",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      quote: "Since implementing BusinessPortal, we've reduced our administrative overhead by 40%. The ROI has been outstanding.",
      author: "Emily Chen",
      company: "Growth Advisors",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  ];

  const clients = [
    {
      name: "Acme Corp",
      logo: "https://via.placeholder.com/150x50/f3f4f6/666666?text=ACME+CORP",
    },
    {
      name: "TechGrow",
      logo: "https://via.placeholder.com/150x50/f3f4f6/666666?text=TECHGROW",
    },
    {
      name: "Global Systems",
      logo: "https://via.placeholder.com/150x50/f3f4f6/666666?text=GLOBAL+SYSTEMS",
    },
    {
      name: "Innovate Inc",
      logo: "https://via.placeholder.com/150x50/f3f4f6/666666?text=INNOVATE",
    },
    {
      name: "Bright Solutions",
      logo: "https://via.placeholder.com/150x50/f3f4f6/666666?text=BRIGHT+SOLUTIONS",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Streamline Your Business Operations
            </h1>
            <p className="mb-8 text-lg sm:text-xl">
              All-in-one business management platform for quotes, invoices, and client communication.
            </p>
            <p className="mb-8 text-lg sm:text-xl">
              Essai gratuit dès aujourd'hui!
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link  to="http://localhost:3000/auth/login" className="btn bg-white text-primary-700 hover:bg-gray-100">
                Démarrez un essai gratuit
              </Link>
              <Link to="/prices" className="btn border border-white bg-transparent text-white hover:bg-white/10">
                Tarification
              </Link>
            </div>
           
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-10"></div>
      </section>
     
      {/* Services Section */}
      <section className="py-16 sm:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Services
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              Discover how our platform can help streamline your business operations.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <span>Learn more about our services</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Us
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              Our platform offers everything you need to manage your business efficiently.
            </p>
          </div>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="order-2 animate-slide-up lg:order-1">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Seamless Client Experience
              </h3>
              <p className="mb-6 text-gray-600">
                Provide your clients with a professional, branded portal where they can view quotes, 
                pay invoices, and communicate with your team - all in one place.
              </p>
              <ul className="space-y-4">
                {[
                  'Secure client portal with login access',
                  'Real-time updates on quotes and invoices',
                  'Easy document sharing and messaging',
                  'Simplified payment process',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link  to="http://localhost:3000/auth/login"  className="btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Team working together"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our Clients Say
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              Don't just take our word for it - hear from our satisfied clients.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                company={testimonial.company}
                image={testimonial.image}
              />
            ))}
          </div>
        </div>
      </section>
      
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
      
      {/* Clients Logo Section */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Trusted by Businesses
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              Join hundreds of businesses already using our platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            {clients.map((client, index) => (
              <ClientCard key={index} logo={client.logo} name={client.name} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 py-16 text-white">
        <div className="container-custom">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to streamline your business?
              </h2>
              <p className="mt-4 text-lg">
                Get started today and see the difference our platform can make for your business.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/quote-request"
                  className="btn bg-white px-5 py-3 text-base font-medium text-primary-600 hover:bg-gray-100"
                >
                  Get Started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/services"
                  className="btn border border-white bg-transparent px-5 py-3 text-base font-medium text-white hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;