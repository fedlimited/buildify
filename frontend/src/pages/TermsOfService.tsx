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
              <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome to BOCHI Construction Suite ("BOCHI", "we", "our", or "us"). These Terms of Service ("Terms") govern your access to and use of BOCHI's construction financial management software, website, and related services (collectively, the "Service").
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                By registering for or using the Service, you agree to be bound by these Terms. If you are using the Service on behalf of a company or organization, you represent that you have authority to bind that entity to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400">BOCHI provides a comprehensive construction financial management platform including:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Project Management:</strong> Track project progress, budgets, and milestones</li>
                <li><strong>Financial Management:</strong> Income, expense, and cash flow tracking</li>
                <li><strong>Payroll Management:</strong> Worker timesheets, payments, and payroll reports</li>
                <li><strong>Procurement:</strong> Purchase orders, suppliers, and inventory management</li>
                <li><strong>Stores Ledger:</strong> Material tracking, stock levels, and store transactions</li>
                <li><strong>Site Diary:</strong> Daily site activities, workers, deliveries, and incidents</li>
                <li><strong>Subcontractor Management:</strong> Contracts, payments, and performance tracking</li>
                <li><strong>Reporting & Analytics:</strong> Profit & Loss, cash flow, VAT, and custom reports</li>
                <li><strong>M-Pesa Integration:</strong> Secure payment processing via Safaricom M-Pesa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Account Registration and Security</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To use the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Not share your account credentials with any third party</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Subscription Plans and Pricing</h2>
              <p className="text-gray-600 dark:text-gray-400">We offer the following subscription plans:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li><strong>Free Plan:</strong> Limited features for solo contractors (1 project, 10 workers, 1 user)</li>
                <li><strong>Basic Plan:</strong> For small businesses (3 projects, 30 workers, 5 users)</li>
                <li><strong>Pro Plan:</strong> For growing companies (10 projects, 150 workers, 15 users)</li>
                <li><strong>Premier Plan:</strong> For large enterprises (unlimited projects, workers, and users)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                All fees are billed in advance on a monthly or yearly basis. Fees are non-refundable except as required by law. We reserve the right to change our fees upon 30 days' notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Free Trial</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We offer a 14-day free trial of the Pro plan. During the trial period:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>You have access to all Pro plan features</li>
                <li>You may cancel at any time without charge</li>
                <li>After the trial, your account will convert to a paid subscription unless canceled</li>
                <li>M-Pesa payments are required to continue using paid features after trial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. M-Pesa Payments</h2>
              <p className="text-gray-600 dark:text-gray-400">
                When making payments via M-Pesa, you acknowledge and agree:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Payments are processed through Safaricom's secure M-Pesa API</li>
                <li>M-Pesa has per-transaction limits of KES 250,000 and daily limits of KES 500,000 per phone number</li>
                <li>Large payments exceeding limits will be split into automatic installments</li>
                <li>You may use different phone numbers for different installments</li>
                <li>Subscription is activated only after all installments are paid in full</li>
                <li>We are not responsible for M-Pesa service interruptions or delays</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Data Ownership and Usage</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You retain full ownership of all data you submit to the Service. By using BOCHI, you grant us a limited license to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Host, store, and display your data to provide the Service</li>
                <li>Use aggregated, anonymized data for analytics and service improvement</li>
                <li>Back up your data for disaster recovery purposes</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We will never sell your data to third parties. Upon account termination, you may export your data. We will delete your data within 30 days after account closure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Acceptable Use Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Use the Service for any illegal purpose or in violation of Kenyan law</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Share your account credentials or resell access to the Service</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Use automated scripts or bots to access the Service</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Service Availability and Support</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We strive to maintain 99.9% uptime for the Service. However, we do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance. Support is provided via email at support@bochi.ke with response times:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Free plan: Best-effort support</li>
                <li>Basic/Pro plans: Within 48 hours</li>
                <li>Premier plan: Within 24 hours, priority support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by law, BOCHI and its affiliates shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages arising from your use of or inability to use the Service</li>
                <li>Third-party service interruptions (M-Pesa, hosting providers, etc.)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Termination</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Either party may terminate your account at any time. Upon termination:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>You may export your data within 30 days</li>
                <li>We will delete your data after 30 days</li>
                <li>No refunds will be provided for prepaid subscription fees</li>
                <li>You remain liable for any outstanding payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these Terms shall be resolved exclusively in the courts of Nairobi, Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use of the Service after such notice constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">14. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📧 <strong>Email:</strong> <a href="mailto:support@bochi.ke" className="text-amber-600 hover:underline">support@bochi.ke</a><br />
                📞 <strong>Phone:</strong> +254 772 041 005<br />
                📍 <strong>Address:</strong> Nairobi, Kenya<br />
                🌐 <strong>Website:</strong> <a href="https://www.bochi.ke" className="text-amber-600 hover:underline">www.bochi.ke</a>
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