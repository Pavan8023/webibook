import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 md:pt-20">
        <div className="container py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Link to="/" className="inline-flex items-center mb-6 text-2xl font-display font-bold text-webi-blue">
                <Calendar className="mr-2 h-6 w-6" />
                Webibook
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
              <div className="prose prose-blue max-w-none">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-6">
                  Welcome to Webibook ("we", "our", or "us"). We are committed to protecting your personal 
                  information and your right to privacy. This Privacy Policy explains how we collect, use, 
                  and share your personal information when you use our webinar platform services.
                </p>
                
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <p className="mb-4">We collect personal information that you voluntarily provide to us:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email, password, role (attendee/hoster)</li>
                  <li><strong>Profile Information:</strong> Bio, interests, profile picture</li>
                  <li><strong>Event Information:</strong> Webinar registrations, participation history</li>
                  <li><strong>Payment Information:</strong> For paid events (processed by third-party services)</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                </ul>
                
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="mb-6">
                  We use your personal information for these purposes:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>To provide and maintain our webinar services</li>
                  <li>To authenticate users and manage accounts</li>
                  <li>To personalize your experience and recommend relevant webinars</li>
                  <li>To process payments for paid events</li>
                  <li>To communicate with you about platform updates and events</li>
                  <li>To improve our services and develop new features</li>
                </ul>
                
                <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
                <p className="mb-6">
                  We only share information with third parties in these circumstances:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li><strong>With Hosts:</strong> When you register for a webinar, hosts receive your name and email</li>
                  <li><strong>Service Providers:</strong> Payment processors, analytics providers</li>
                  <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
                </ul>
                
                <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                <p className="mb-6">
                  We implement industry-standard security measures including encryption, firewalls, and 
                  secure servers to protect your personal information. However, no electronic transmission 
                  or storage method is 100% secure.
                </p>
                
                <h2 className="text-2xl font-bold mb-4">6. Your Privacy Rights</h2>
                <p className="mb-6">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Access, update, or delete your personal information</li>
                  <li>Correct inaccuracies in your data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="mb-6">
                  To exercise these rights, contact us at privacy@webibook.com.
                </p>
                
                <h2 className="text-2xl font-bold mb-4">7. Changes to This Policy</h2>
                <p className="mb-6">
                  We may update this Privacy Policy periodically. We'll notify you of significant changes 
                  by email or through platform notifications.
                </p>
                
                <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
                <p>
                  For privacy-related questions or concerns:
                  <br />
                  Email: privacy@webibook.com
                  <br />
                  Address: 123 Webinar Street, Virtual City, VC 12345
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;