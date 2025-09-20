import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import WebiBookLogo from '/images/WebiBook.png';
import { Link } from 'react-router-dom';

const Tnc = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16 md:pt-20">
        <div className="container py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Link
                to="/home" style={{ marginLeft: 350 }}
                className="text-2xl font-display font-bold flex items-center text-webi-blue transition-opacity hover:opacity-90"
              >
                <img src={WebiBookLogo} className="h-16 w-16" alt="Webibook" />
                <span>
                  <span className="text-purple-600">Webi</span>
                  <span className="text-red-500">Book</span>
                </span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms and Conditions</h1>
              <p className="text-muted-foreground">
                Effective Date: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
              <div className="prose prose-blue max-w-none">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="mb-6">
                  By accessing or using the Webibook platform ("Service"), you agree to be bound by these
                  Terms and Conditions ("Terms"). If you disagree with any part, you may not access the Service.
                </p>

                <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
                <p className="mb-4">To use our services, you must:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Be at least 16 years old</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized account use</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
                <h3 className="text-xl font-semibold mb-2 mt-4">As an Attendee:</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Respect webinar hosts and other participants</li>
                  <li>Do not record webinars without explicit permission</li>
                  <li>Follow event-specific rules set by hosts</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">As a Hoster:</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Provide accurate event descriptions</li>
                  <li>Start and end webinars as scheduled</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Handle attendee data responsibly and legally</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">4. Content Ownership</h2>
                <p className="mb-6">
                  <strong>Hoster Content:</strong> You retain ownership of all content you create and present
                  through Webibook. By using our platform, you grant Webibook a license to host, stream,
                  and distribute your content to registered attendees.
                  <br /><br />
                  <strong>Platform Content:</strong> All Webibook software, design, trademarks, and
                  documentation are our intellectual property.
                </p>

                <h2 className="text-2xl font-bold mb-4">5. Payment Terms</h2>
                <p className="mb-4">For paid webinars:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Hosters set ticket prices and receive payments minus processing fees (10%)</li>
                  <li>Payments are processed through our third-party payment partners</li>
                  <li>Refund policies are set by individual hosters</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">6. Prohibited Activities</h2>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Host illegal, dangerous, or harmful content</li>
                  <li>Impersonate others or misrepresent affiliations</li>
                  <li>Harass, threaten, or discriminate against others</li>
                  <li>Distribute viruses or malicious software</li>
                  <li>Reverse engineer or hack our platform</li>
                  <li>Violate intellectual property rights</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
                <p className="mb-6">
                  We may suspend or terminate your account if you violate these Terms. You may terminate
                  your account at any time through your account settings.
                </p>

                <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
                <p className="mb-6">
                  Our Service is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Uninterrupted or error-free service</li>
                  <li>Accuracy of webinar content</li>
                  <li>Results from using our platform</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p className="mb-6">
                  To the maximum extent permitted by law, Webibook shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages resulting from your use of the Service.
                </p>

                <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
                <p className="mb-6">
                  We reserve the right to modify these Terms at any time. Continued use after changes constitutes
                  acceptance of the new Terms.
                </p>

                <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
                <p className="mb-6">
                  These Terms shall be governed by the laws of the State of California, USA, without regard to
                  its conflict of law principles.
                </p>

                <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
                <p>
                  For questions about these Terms:
                  <br />
                  Email: webibook.ai@gmail.com
                  <br />
                  Address: Company Launching Soon
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

export default Tnc;