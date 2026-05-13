import { useAppStore } from '@/hooks/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileText, AlertCircle, CheckCircle, Key, Users, Building2, Scale, Shield, Clock, Mail, Phone, MapPin, Globe, Lock, Download, Eye, Edit, Trash2, UserPlus, Calendar, MessageSquare, Bell, HardHat, Truck, Package, Receipt, BarChart3, PieChart, Database, Cloud, Server, Zap } from 'lucide-react';

export function TermsOfService() {
  const { companySettings } = useAppStore();
  const currentYear = new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Scale size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-1" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
          <CardDescription>Last updated: May 10, 2026 | Effective Date: May 10, 2026 | Version: 2.1.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          {/* IMPORTANT NOTICE */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border-l-4 border-amber-500">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> IMPORTANT LEGAL NOTICE
            </p>
            <p className="text-xs text-muted-foreground">
              By accessing or using the BOCHI Construction Suite ("the Software"), you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must 
              immediately cease using the Software.
            </p>
          </div>

          {/* SECTION 1: DEFINITIONS */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <FileText size={18} /> 1. DEFINITIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">🏢 Company</p>
                <p className="text-xs text-muted-foreground">Finite Element Designs Ltd, registered in the Republic of Kenya</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">💻 Software</p>
                <p className="text-xs text-muted-foreground">BOCHI Construction Suite, including all code, documentation, and materials</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">👤 User</p>
                <p className="text-xs text-muted-foreground">Any individual or entity accessing or using the Software</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">🤝 Stakeholder</p>
                <p className="text-xs text-muted-foreground">Clients, architects, engineers, consultants invited to access project information</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">📊 Data</p>
                <p className="text-xs text-muted-foreground">All information, records, and content input into the Software</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">🔑 OTP</p>
                <p className="text-xs text-muted-foreground">One-Time Password, a time-sensitive authentication code sent via email</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: LICENSE GRANT */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <CheckCircle size={18} /> 2. LICENSE GRANT
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Finite Element Designs Ltd grants you a non-exclusive, non-transferable, revocable license to use the Software 
              for your internal business operations only.
            </p>
            <p className="text-sm font-semibold mt-2">This license does NOT permit:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-1">
              <li>Commercial resale, sublicensing, or distribution of the Software</li>
              <li>Modification, reverse engineering, decompilation, or disassembly</li>
              <li>Use of the Software for any unlawful purpose</li>
              <li>Creation of derivative works based on the Software</li>
              <li>Access to the Software by unauthorized third parties</li>
              <li>Use of the Software for competitive analysis</li>
            </ul>
          </div>

          {/* SECTION 3: OTP AUTHENTICATION */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Key size={18} /> 3. OTP AUTHENTICATION & SECURITY
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              The Software uses OTP (One-Time Password) authentication for secure, passwordless login:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Each login requires a unique OTP sent to your registered email address</li>
              <li>OTPs expire within <strong>5 minutes</strong> of generation</li>
              <li>You must not share your OTP with any third party</li>
              <li>The Company will <strong>never</strong> ask you for your OTP</li>
              <li>You are responsible for maintaining the security of your email account</li>
              <li>Report any unauthorized access attempts immediately</li>
              <li>OTP codes are single-use and cannot be reused</li>
              <li>Sessions automatically timeout after period of inactivity</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mt-3">
              <p className="text-xs flex items-center gap-2">
                <Shield size={14} className="text-blue-500" />
                <strong>Security Best Practices:</strong> Always logout when finished, never share OTPs, and report suspicious activity immediately.
              </p>
            </div>
          </div>

          {/* SECTION 4: STAKEHOLDER ACCESS */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Users size={18} /> 4. STAKEHOLDER ACCESS TERMS
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Stakeholders (clients, architects, engineers, consultants) invited to the Software:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700">✅ Permitted Activities</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>View project progress and status updates</li>
                  <li>Read meeting minutes, agendas, decisions</li>
                  <li>Download documents, drawings, reports</li>
                  <li>View financial summaries</li>
                  <li>View project team members</li>
                  <li>Track assigned action items</li>
                  <li>Update task status (Pending → In Progress → Completed)</li>
                  <li>Approve/reject meeting minutes (if authorized)</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-700">❌ Prohibited Activities</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Modify project data or financial records</li>
                  <li>Delete any information</li>
                  <li>Invite other users to the platform</li>
                  <li>Access uninvited projects</li>
                  <li>Bulk data export for commercial use</li>
                  <li>Share login credentials or OTPs</li>
                  <li>Access after access termination</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 5: USER RESPONSIBILITIES */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <UserPlus size={18} /> 5. USER RESPONSIBILITIES
            </h2>
            <p className="text-sm text-muted-foreground mb-2">Users agree to:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain confidentiality of OTPs and authentication codes</li>
              <li>Notify the Company immediately of any security breaches</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Use the Software only for legitimate business purposes</li>
              <li>Backup data regularly using the Settings module</li>
              <li>Verify critical data independently before making decisions</li>
              <li>Report bugs, errors, or security concerns promptly</li>
            </ul>
          </div>

          {/* SECTION 6: DATA OWNERSHIP */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Database size={18} /> 6. DATA OWNERSHIP & RESPONSIBILITY
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Your Data is Yours:</strong> All data entered by users remains the property of the user or their organization. 
              The Company claims no ownership over user-generated content, project data, financial records, or stakeholder information.
            </p>
            <p className="text-sm font-semibold mt-2">User Responsibilities for Data:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Accuracy, completeness, and legality of all entered data</li>
              <li>Maintaining backups (weekly backups recommended)</li>
              <li>Compliance with data protection laws regarding your data</li>
              <li>Consequences arising from incorrect or incomplete data</li>
              <li>Ensuring authorized access only to your data</li>
            </ul>
          </div>

          {/* SECTION 7: NO WARRANTY */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <AlertCircle size={18} /> 7. NO WARRANTY & DISCLAIMER
            </h2>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border-l-4 border-red-500 mb-2">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE"</p>
            </div>
            <p className="text-sm text-muted-foreground mb-2">No warranties of any kind, either express or implied, including but not limited to:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>Error-free, uninterrupted, or secure operation</li>
              <li>Accuracy, reliability, or completeness of generated data</li>
              <li>Meeting specific user requirements</li>
              <li>Compatibility with all systems or devices</li>
            </ul>
          </div>

          {/* SECTION 8: LIMITATION OF LIABILITY */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Scale size={18} /> 8. LIMITATION OF LIABILITY
            </h2>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border-l-4 border-red-500 mb-2">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW</p>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Finite Element Designs Ltd shall NOT be liable for:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Costs of procurement of substitute goods or services</li>
              <li>Damages from use or inability to use the Software</li>
              <li>Damages from unauthorized access or data alteration</li>
              <li>Damages arising from errors, omissions, or inaccuracies</li>
              <li>Damages from decisions made based on Software output</li>
              <li>Damages from payroll, tax, or financial miscalculations</li>
            </ul>
          </div>

          {/* SECTION 9: INDEMNIFICATION */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Shield size={18} /> 9. INDEMNIFICATION
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              You agree to indemnify, defend, and hold harmless Finite Element Designs Ltd from any claims arising from:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Your use of the Software</li>
              <li>Violation of these Terms of Service</li>
              <li>Violation of any applicable laws or regulations</li>
              <li>Your data or content input into the Software</li>
              <li>Infringement of any third-party rights</li>
              <li>Unauthorized access using your account</li>
            </ul>
          </div>

          {/* SECTION 10: SERVICE SUSPENSION & TERMINATION */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Clock size={18} /> 10. SERVICE SUSPENSION & TERMINATION
            </h2>
            <p className="text-sm text-muted-foreground mb-2">The Company may suspend or terminate access immediately for:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Violation of these Terms</li>
              <li>Unpaid subscription fees (if applicable)</li>
              <li>Illegal or fraudulent activity</li>
              <li>Security concerns or system abuse</li>
              <li>Request by law enforcement or regulatory authority</li>
            </ul>
          </div>

          {/* SECTION 11: GOVERNING LAW */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Globe size={18} /> 11. GOVERNING LAW & JURISDICTION
            </h2>
            <p className="text-sm text-muted-foreground">
              These Terms shall be governed by the laws of the <strong>Republic of Kenya</strong>. Any dispute shall be subject 
              to the exclusive jurisdiction of the courts of the Republic of Kenya.
            </p>
          </div>

          {/* SECTION 12: MODIFICATIONS */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Edit size={18} /> 12. MODIFICATIONS TO TERMS
            </h2>
            <p className="text-sm text-muted-foreground">
              The Company reserves the right to modify these Terms at any time. Continued use after modifications constitutes 
              acceptance. Users will be notified of material changes via email or in-app notification.
            </p>
          </div>

          {/* SECTION 13: CONTACT */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Mail size={18} /> 13. CONTACT INFORMATION
            </h2>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-sm"><strong>Finite Element Designs Ltd</strong></p>
              <p className="text-xs flex items-center gap-2"><MapPin size={12} /> Deep Blue Building, Thika Road, Nairobi, Kenya</p>
              <p className="text-xs flex items-center gap-2"><Mail size={12} /> finiteelementdesignsltd@gmail.com</p>
              <p className="text-xs flex items-center gap-2"><Phone size={12} /> +254 772 041 005</p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t pt-4 mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Finite Element Designs Ltd. All rights reserved.<br/>
              BOCHI Construction Suite v2.1.0 | OTP Authentication | Stakeholder Portal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}