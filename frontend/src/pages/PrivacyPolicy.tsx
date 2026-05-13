import { useAppStore } from '@/hooks/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Shield, Eye, Lock, Database, Mail, Phone, MapPin, Globe, Key, Users, Bell, FileText, CheckCircle, AlertCircle, Trash2, Download, Cloud, Server } from 'lucide-react';

export function PrivacyPolicy() {
  const { companySettings } = useAppStore();
  const currentYear = new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-1" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last updated: May 10, 2026 | Effective Date: May 10, 2026 | Version: 2.1.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          {/* PRIVACY COMMITMENT */}
          <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Shield size={18} /> PRIVACY COMMITMENT
            </p>
            <p className="text-xs text-muted-foreground">
              Finite Element Designs Ltd is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use the BOCHI Construction Suite.
            </p>
          </div>

          {/* SECTION 1: INFORMATION COLLECTED */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Database size={18} /> 1. INFORMATION WE COLLECT
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Building2 size={14} /> Business Information</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Project details and specifications</li>
                  <li>Financial records and transactions</li>
                  <li>Worker information and payroll data</li>
                  <li>Subcontractor and supplier details</li>
                  <li>Purchase orders and inventory records</li>
                  <li>Site diary entries and reports</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Users size={14} /> Account Information</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Name and email address</li>
                  <li>Role and permissions</li>
                  <li>Company subdomain</li>
                  <li>Login history and access logs</li>
                  <li>IP addresses (for security)</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Key size={14} /> Stakeholder Information</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Name and email address</li>
                  <li>Role in project</li>
                  <li>Invitation status</li>
                  <li>Meeting attendance records</li>
                  <li>Approval history</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Eye size={14} /> Usage Data</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Interaction with Software features</li>
                  <li>Performance metrics</li>
                  <li>Error logs and crash reports</li>
                  <li>Feature usage frequency</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 2: HOW WE USE INFORMATION */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <FileText size={18} /> 2. HOW WE USE YOUR INFORMATION
            </h2>
            <p className="text-sm text-muted-foreground mb-2">We use your information for:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs">Providing and maintaining Software functionality</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <Mail size={14} className="text-green-500" />
                <span className="text-xs">Sending OTP authentication codes</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <Bell size={14} className="text-green-500" />
                <span className="text-xs">Sending invitations and notifications</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <BarChart3 size={14} className="text-green-500" />
                <span className="text-xs">Generating reports and analytics</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <Server size={14} className="text-green-500" />
                <span className="text-xs">Improving and optimizing the Software</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <MessageSquare size={14} className="text-green-500" />
                <span className="text-xs">Responding to support inquiries</span>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 mt-2">
              <p className="text-xs flex items-center gap-2">
                <AlertCircle size={12} className="text-amber-500" />
                We do NOT sell, rent, or trade your data to third parties. Your data belongs to you.
              </p>
            </div>
          </div>

          {/* SECTION 3: OTP & EMAIL COMMUNICATIONS */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Mail size={18} /> 3. OTP & EMAIL COMMUNICATIONS
            </h2>
            <p className="text-sm text-muted-foreground mb-2">The Software sends the following types of emails:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Key size={14} /><span className="text-xs">OTP authentication codes for login</span></div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><UserPlus size={14} /><span className="text-xs">Project invitation emails</span></div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><CheckCircle size={14} /><span className="text-xs">Task assignment notifications</span></div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Users size={14} /><span className="text-xs">Meeting minutes approval requests</span></div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><FileText size={14} /><span className="text-xs">Document update notifications</span></div>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Bell size={14} /><span className="text-xs">Apology request for meeting absences</span></div>
            </div>
          </div>

          {/* SECTION 4: DATA STORAGE & SECURITY */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Cloud size={18} /> 4. DATA STORAGE & SECURITY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">📊 Storage Location</p>
                <p className="text-xs text-muted-foreground">Cloud PostgreSQL database hosted on Render (Enterprise-grade infrastructure)</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">🔒 Security Measures</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5 mt-1">
                  <li>Encryption in transit (TLS/SSL)</li>
                  <li>Encryption at rest (AES-256)</li>
                  <li>Regular automated backups</li>
                  <li>Role-based access control (RBAC)</li>
                  <li>Access logging and monitoring</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">⏰ Data Retention</p>
                <p className="text-xs text-muted-foreground">Data retained while account is active. Deleted upon request, subject to legal requirements.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold">💾 Backups</p>
                <p className="text-xs text-muted-foreground">Daily automated backups with 30-day retention. User-initiated backups available via Settings module.</p>
              </div>
            </div>
          </div>

          {/* SECTION 5: DATA PROTECTION RIGHTS (KENYA DPA 2019) */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Globe size={18} /> 5. YOUR RIGHTS UNDER KENYAN LAW
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Under the <strong>Kenya Data Protection Act (DPA), 2019</strong>, you have the following rights:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><Eye size={14} /><span className="text-xs"><strong>Right to Access</strong> - Request copies of your personal data</span></div>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><Edit size={14} /><span className="text-xs"><strong>Right to Rectification</strong> - Correct inaccurate data</span></div>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><Trash2 size={14} /><span className="text-xs"><strong>Right to Erasure</strong> - Request deletion of your data</span></div>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><AlertCircle size={14} /><span className="text-xs"><strong>Right to Object</strong> - Object to data processing</span></div>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><Download size={14} /><span className="text-xs"><strong>Right to Portability</strong> - Receive data in structured format</span></div>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded"><Lock size={14} /><span className="text-xs"><strong>Right to Withdraw Consent</strong> - Withdraw at any time</span></div>
            </div>
          </div>

          {/* SECTION 6: COOKIES & TRACKING */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Eye size={18} /> 6. COOKIES & TRACKING
            </h2>
            <p className="text-sm text-muted-foreground">
              The Software uses authentication cookies to maintain your session. No third-party tracking cookies are used. 
              You may disable cookies in your browser, but the Software may not function correctly.
            </p>
          </div>

          {/* SECTION 7: CHILDREN'S PRIVACY */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Users size={18} /> 7. CHILDREN'S PRIVACY
            </h2>
            <p className="text-sm text-muted-foreground">
              The Software is not intended for children under 18 years of age. We do not knowingly collect personal information 
              from children under 18. If you believe we have collected such information, please contact us immediately.
            </p>
          </div>

          {/* SECTION 8: DATA BREACH PROCEDURES */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <AlertCircle size={18} /> 8. DATA BREACH PROCEDURES
            </h2>
            <p className="text-sm text-muted-foreground">
              In the event of a data breach, the Company will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-1">
              <li>Notify affected users within 72 hours of discovery</li>
              <li>Report to the Office of the Data Protection Commissioner (ODPC) as required by law</li>
              <li>Initiate immediate investigation and remediation</li>
              <li>Provide recommendations for user self-protection</li>
            </ul>
          </div>

          {/* SECTION 9: THIRD-PARTY SERVICES */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Server size={18} /> 9. THIRD-PARTY SERVICES
            </h2>
            <p className="text-sm text-muted-foreground">
              The Software integrates with the following third-party services:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mt-1">
              <li><strong>Render</strong> - Cloud hosting and database services</li>
              <li><strong>SMTP Server</strong> - Email delivery for OTPs and notifications (mail.bochi.ke)</li>
              <li>No other third-party data processors are used</li>
            </ul>
          </div>

          {/* SECTION 10: POLICY UPDATES */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <FileText size={18} /> 10. POLICY UPDATES
            </h2>
            <p className="text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time. Material changes will be notified via email or in-app 
              notification. The "Last updated" date at the top indicates when changes were made.
            </p>
          </div>

          {/* SECTION 11: CONTACT INFORMATION */}
          <div>
            <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <Mail size={18} /> 11. CONTACT INFORMATION
            </h2>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-sm"><strong>Data Protection Officer / Legal Department</strong></p>
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
              BOCHI Construction Suite v2.1.0 | Compliant with Kenya Data Protection Act (DPA) 2019
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}