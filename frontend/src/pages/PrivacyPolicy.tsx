import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Last updated: May 5, 2026</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400">
                BOCHI Construction Suite ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-400">We collect information you provide directly to us:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Name, email address, phone number</li>
                <li>Company name, address, KRA PIN</li>
                <li>Payment information (processed securely via M-Pesa/Stripe)</li>
                <li>Project data, worker information, financial records</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We implement appropriate technical and organizational measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                secure servers, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Service providers who assist in our operations (payment processors, hosting)</li>
                <li>Law enforcement when required by law</li>
                <li>With your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We retain your personal data for as long as your account is active or as needed to provide services. 
                After account deletion, we retain data as required by law for compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Access and receive a copy of your data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict data processing</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We use cookies and similar tracking technologies to improve your experience, 
                analyze usage, and personalize content. You can control cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our service uses third-party providers including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>M-Pesa (Safaricom) for payment processing</li>
                <li>Render for cloud hosting</li>
                <li>PostgreSQL for database services</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                These services have their own privacy policies governing your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. International Data Transfers</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your information may be transferred to and processed in countries outside your residence. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Children's Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our service is not directed to children under 16. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                via email or through the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">13. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📧 Email: <a href="mailto:support@bochi.ke" className="text-amber-600 hover:underline">support@bochi.ke</a><br />
                📞 Phone: +254 722 886 353<br />
                📍 Address: Nairobi, Kenya
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t text-center">
            <Link to="/login" className="text-amber-600 hover:underline">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};