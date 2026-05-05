import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-6">Last updated: May 5, 2026</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                By accessing or using BOCHI Construction Suite ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400">
                BOCHI provides construction financial management software including, but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Project tracking and management</li>
                <li>Expense and income tracking</li>
                <li>Payroll management</li>
                <li>Procurement and purchase orders</li>
                <li>Stores and inventory management</li>
                <li>Site diary and daily reporting</li>
                <li>Subcontractor management</li>
                <li>Financial reporting and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You are responsible for maintaining the confidentiality of your account credentials. 
                Notify us immediately of any unauthorized use of your account. 
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Subscription and Billing</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Subscription fees are billed in advance on a monthly or yearly basis. 
                All payments are processed securely via M-Pesa or credit card. 
                Fees are non-refundable except as required by applicable law.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We reserve the right to change our subscription fees upon notice. 
                Any price changes will apply to future billing cycles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Free Trial</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We offer a 14-day free trial for new users. 
                After the trial period, you will be automatically converted to a paid subscription unless you cancel.
                You may cancel your subscription at any time during the trial period without charge.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Acceptable Use</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Reverse engineer or copy any part of the Service</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Data Ownership and Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You retain ownership of all data you submit to the Service. 
                We do not sell your personal data. Our use of your data is governed by our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by law, BOCHI is not liable for any indirect, incidental, 
                special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The Service is provided "as is" without warranties of any kind. 
                We do not guarantee that the Service will be uninterrupted or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Termination</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may terminate or suspend your account immediately, without prior notice, 
                for conduct that violates these terms. You may cancel your account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These terms shall be governed by the laws of the Republic of Kenya. 
                Any disputes shall be resolved in the courts of Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may modify these terms at any time. Continued use of the Service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">13. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about these Terms, contact us at:
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