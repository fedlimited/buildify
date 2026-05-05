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
                BOCHI Construction Suite ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our construction financial management software and related services (collectively, the "Service").
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We comply with the Kenya Data Protection Act, 2019. Please read this policy carefully. By using the Service, you consent to our collection and use of your information as described herein.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-400 font-medium">2.1 Information You Provide Directly:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 mb-3 space-y-1">
                <li>Account information: name, email address, phone number, password</li>
                <li>Company information: company name, address, KRA PIN, subdomain</li>
                <li>Project data: project names, clients, contract amounts, locations, dates</li>
                <li>Financial data: income records, expense records, invoice details</li>
                <li>Worker data: worker names, roles, rates, payroll records</li>
                <li>Subcontractor data: subcontractor details, contracts, payments</li>
                <li>Supplier data: supplier information, purchase orders</li>
                <li>Site diary entries: daily activities, worker attendance, deliveries</li>
                <li>Payment information: M-Pesa transactions (processed through Safaricom)</li>
                <li>Communications: support requests, feedback, survey responses</li>
              </ul>

              <p className="text-gray-600 dark:text-gray-400 font-medium">2.2 Information Automatically Collected:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 mb-3 space-y-1">
                <li>Log data: IP address, browser type, device information, access times</li>
                <li>Usage data: features used, pages visited, time spent, click patterns</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Performance data: load times, error reports</li>
              </ul>

              <p className="text-gray-600 dark:text-gray-400 font-medium">2.3 Information from Third Parties:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>Safaricom M-Pesa: transaction status and payment confirmation</li>
                <li>Render: hosting and infrastructure data</li>
                <li>Email service providers: email delivery status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400">We use your information for the following purposes:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Provide the Service:</strong> Process transactions, manage projects, generate reports, track workers</li>
                <li><strong>Account Management:</strong> Create and manage your account, authenticate login, manage subscriptions</li>
                <li><strong>Payment Processing:</strong> Process M-Pesa payments, manage billing, send invoices</li>
                <li><strong>Customer Support:</strong> Respond to inquiries, troubleshoot issues, provide assistance</li>
                <li><strong>Service Improvement:</strong> Analyze usage patterns, improve features, optimize performance</li>
                <li><strong>Security:</strong> Detect and prevent fraud, protect against unauthorized access</li>
                <li><strong>Communications:</strong> Send service updates, billing notices, security alerts, and promotional materials (with opt-out)</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations, enforce our terms, protect rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Legal Basis for Processing (for EEA/UK users)</h2>
              <p className="text-gray-600 dark:text-gray-400">We process your personal data based on:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Contractual necessity:</strong> To provide the Service you requested</li>
                <li><strong>Legitimate interests:</strong> To improve our Service and ensure security</li>
                <li><strong>Legal obligations:</strong> To comply with tax and regulatory requirements</li>
                <li><strong>Consent:</strong> For marketing communications (you may withdraw anytime)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 dark:text-gray-400">We do not sell your personal data. We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Service Providers:</strong> Third-party vendors who assist with hosting, payment processing, email delivery, and analytics (they are contractually bound to protect your data)</li>
                <li><strong>Payment Processing:</strong> Safaricom M-Pesa processes your payments; your payment information is subject to their privacy policy</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation (e.g., KRA tax audits)</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you will be notified)</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400">We implement robust security measures to protect your data:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Authentication:</strong> Strong password requirements and OTP verification</li>
                <li><strong>Access Controls:</strong> Role-based access control for users within your company</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and logging</li>
                <li><strong>Backups:</strong> Regular encrypted backups with 30-day retention</li>
                <li><strong>Compliance:</strong> GDPR and Kenya Data Protection Act compliant practices</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Data Retention</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We retain your personal data for as long as your account is active or as needed to provide the Service. After account termination:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>You may export your data within 30 days</li>
                <li>We will delete your personal data after 30 days</li>
                <li>Some data may be retained longer for legal compliance (e.g., tax records for 7 years)</li>
                <li>Anonymized aggregate data may be retained indefinitely for analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400">Under the Kenya Data Protection Act and applicable laws, you have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Restriction:</strong> Limit how we use your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
                <li><strong>Lodge a Complaint:</strong> File a complaint with the Office of the Data Protection Commissioner (ODPC)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                To exercise these rights, contact us at <a href="mailto:privacy@bochi.ke" className="text-amber-600 hover:underline">privacy@bochi.ke</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. M-Pesa Payment Data</h2>
              <p className="text-gray-600 dark:text-gray-400">
                When you make payments via M-Pesa:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Your phone number is used only to initiate the STK Push payment prompt</li>
                <li>We do not store your M-Pesa PIN or full payment credentials</li>
                <li>Transaction details are processed through Safaricom's secure API</li>
                <li>We store transaction IDs and payment statuses for reconciliation</li>
                <li>Safaricom's <a href="https://www.safaricom.co.ke/privacy-policy" className="text-amber-600 hover:underline">Privacy Policy</a> applies to M-Pesa transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Authenticate your session and maintain login state</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our Service</li>
                <li>Detect and prevent fraudulent activity</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                You can control cookies through your browser settings. However, disabling cookies may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-400">Our Service integrates with third-party services:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Safaricom M-Pesa:</strong> Payment processing (<a href="https://www.safaricom.co.ke/privacy-policy" className="text-amber-600 hover:underline">Privacy Policy</a>)</li>
                <li><strong>Render:</strong> Cloud hosting and infrastructure</li>
                <li><strong>PostgreSQL:</strong> Database services</li>
                <li><strong>SendGrid/Email Service:</strong> Transactional email delivery</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                These third parties have their own privacy policies governing your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. International Data Transfers</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your information may be transferred to and processed in countries outside your residence, including Kenya and the United States. We ensure appropriate safeguards are in place for such transfers, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Data processing agreements with our service providers</li>
                <li>Adequacy decisions where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">13. Children's Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our Service is not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us, and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">14. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of material changes via:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Email to your registered address</li>
                <li>In-app notification</li>
                <li>A notice on our website</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Continued use of the Service after such notice constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">15. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For privacy-related questions, data subject requests, or concerns about our data practices:
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <strong>Data Protection Officer:</strong> Phares Atai<br />
                📧 <strong>Email:</strong> <a href="mailto:privacy@bochi.ke" className="text-amber-600 hover:underline">privacy@bochi.ke</a><br />
                📧 <strong>Support:</strong> <a href="mailto:support@bochi.ke" className="text-amber-600 hover:underline">support@bochi.ke</a><br />
                📞 <strong>Phone:</strong> +254 722 886 353<br />
                📍 <strong>Address:</strong> Nairobi, Kenya<br />
                🌐 <strong>Website:</strong> <a href="https://www.bochi.ke" className="text-amber-600 hover:underline">www.bochi.ke</a>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <strong>Office of the Data Protection Commissioner (ODPC):</strong><br />
                Website: <a href="https://www.odpc.go.ke" className="text-amber-600 hover:underline">www.odpc.go.ke</a>
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