import { useAppStore } from '@/hooks/useAppStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, FileText, Shield, Printer, AlertCircle, CheckCircle, Globe, Lock, Copyright, Gavel, BookOpen, MapPin, Key, Users } from 'lucide-react';

export function LegalModule() {
  const { companySettings } = useAppStore();

  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Legal & Compliance</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-1" /> Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="terms" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="disclaimer">Disclaimer & Liability</TabsTrigger>
          <TabsTrigger value="stakeholder">Stakeholder Terms</TabsTrigger>
          <TabsTrigger value="copyright">Copyright & IP</TabsTrigger>
          <TabsTrigger value="compliance">Legal Compliance</TabsTrigger>
        </TabsList>

        {/* Terms of Service */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Terms of Service
              </CardTitle>
              <CardDescription>Last updated: May 10, 2026 | Effective Date: May 10, 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 prose prose-sm max-w-none">
              <div className="bg-primary/5 rounded-lg p-4 mb-4 border-l-4 border-primary">
                <p className="text-sm font-semibold mb-2">⚠️ IMPORTANT LEGAL NOTICE</p>
                <p className="text-xs text-muted-foreground">
                  By accessing or using the BOCHI Construction Suite ("the Software"), you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must 
                  immediately cease using the Software.
                </p>
              </div>

              <h3 className="text-base font-semibold mt-4">1. DEFINITIONS</h3>
              <p className="text-sm text-muted-foreground">
                <strong>"Company"</strong> means Finite Element Designs Ltd, a company duly registered in the Republic of Kenya.<br/>
                <strong>"Software"</strong> means the BOCHI Construction Suite, including all source code, documentation, and related materials.<br/>
                <strong>"User"</strong> means any individual or entity accessing or using the Software.<br/>
                <strong>"Stakeholder"</strong> means any client, architect, engineer, consultant, or other third party invited to access project information.<br/>
                <strong>"Data"</strong> means all information, records, and content input into the Software by the User.<br/>
                <strong>"OTP"</strong> means One-Time Password, a time-sensitive authentication code sent via email for secure login.
              </p>

              <h3 className="text-base font-semibold mt-4">2. LICENSE GRANT</h3>
              <p className="text-sm text-muted-foreground">
                Finite Element Designs Ltd grants you a non-exclusive, non-transferable, revocable license to use the Software 
                for your internal business operations only. This license does not permit:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Commercial resale, sublicensing, or distribution of the Software</li>
                <li>Modification, reverse engineering, decompilation, or disassembly of the Software</li>
                <li>Use of the Software for any unlawful purpose or in violation of any applicable laws</li>
                <li>Creation of derivative works based on the Software</li>
                <li>Access to the Software by unauthorized third parties</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">3. OTP AUTHENTICATION & SECURITY</h3>
              <p className="text-sm text-muted-foreground">
                The Software uses OTP (One-Time Password) authentication for secure, passwordless login:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Each login requires a unique OTP sent to your registered email address</li>
                <li>OTPs expire within 5 minutes of generation</li>
                <li>You must not share your OTP with any third party</li>
                <li>The Company will never ask you for your OTP</li>
                <li>You are responsible for maintaining the security of your email account</li>
                <li>Report any unauthorized access attempts immediately</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">4. STAKEHOLDER ACCESS</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholders (clients, architects, engineers, consultants) invited to the Software:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Receive access only to projects to which they are explicitly invited</li>
                <li>Have view-only access to project information unless granted approval permissions</li>
                <li>May approve or reject meeting minutes if authorized</li>
                <li>May update status of tasks assigned to them</li>
                <li>Cannot modify financial data or delete records</li>
                <li>Access logs are maintained for audit purposes</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">5. NO WARRANTY & DISCLAIMER</h3>
              <p className="text-sm text-muted-foreground">
                THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT</li>
                <li>WARRANTIES THAT THE SOFTWARE WILL BE ERROR-FREE, UNINTERRUPTED, OR SECURE</li>
                <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY DATA GENERATED BY THE SOFTWARE</li>
                <li>WARRANTIES THAT THE SOFTWARE WILL MEET YOUR SPECIFIC REQUIREMENTS</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                No advice or information, whether oral or written, obtained from the Company shall create any warranty not expressly stated herein.
              </p>

              <h3 className="text-base font-semibold mt-4">6. LIMITATION OF LIABILITY</h3>
              <p className="text-sm text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FINITE ELEMENT DESIGNS LTD, ITS DIRECTORS, 
                OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES</li>
                <li>COSTS OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES</li>
                <li>DAMAGES ARISING FROM THE USE OR INABILITY TO USE THE SOFTWARE</li>
                <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
                <li>DAMAGES ARISING FROM ERRORS, OMISSIONS, OR INACCURACIES IN THE SOFTWARE</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                This limitation of liability applies regardless of the legal theory (contract, tort, negligence, or otherwise) and 
                whether or not the Company has been advised of the possibility of such damages.
              </p>

              <h3 className="text-base font-semibold mt-4">7. INDEMNIFICATION</h3>
              <p className="text-sm text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Finite Element Designs Ltd and its directors, officers, employees, 
                and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable 
                legal fees) arising from:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Your use of the Software</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Your data or content input into the Software</li>
                <li>Your infringement of any third-party rights</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">8. GOVERNING LAW & JURISDICTION</h3>
              <p className="text-sm text-muted-foreground">
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Kenya, 
                without regard to its conflict of law principles. Any dispute arising from these terms shall be subject to the 
                exclusive jurisdiction of the courts of the Republic of Kenya.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Policy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Privacy Policy
              </CardTitle>
              <CardDescription>Last updated: May 10, 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 prose prose-sm max-w-none">
              <div className="bg-primary/5 rounded-lg p-4 mb-4 border-l-4 border-primary">
                <p className="text-sm font-semibold mb-2">🔒 PRIVACY COMMITMENT</p>
                <p className="text-xs text-muted-foreground">
                  Finite Element Designs Ltd is committed to protecting your privacy. This Privacy Policy explains how we handle 
                  information collected through the BOCHI Construction Suite.
                </p>
              </div>

              <h3 className="text-base font-semibold mt-4">1. INFORMATION WE COLLECT</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Business Information:</strong> Project details, financial records, worker information, subcontractor details, 
                operational data, and all content you voluntarily input into the Software.<br/><br/>
                <strong>Account Information:</strong> Name, email address, role, permissions, and subdomain when you create a user account.<br/><br/>
                <strong>Stakeholder Information:</strong> Name, email address, role in project, and invitation status.<br/><br/>
                <strong>Usage Data:</strong> Information about how you interact with the Software (collected for performance monitoring).
              </p>

              <h3 className="text-base font-semibold mt-4">2. HOW WE USE YOUR INFORMATION</h3>
              <p className="text-sm text-muted-foreground">
                We use your information solely for:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Providing and maintaining the Software's functionality</li>
                <li>Sending OTP authentication codes to your email</li>
                <li>Sending project invitations and notifications to stakeholders</li>
                <li>Processing transactions and generating reports</li>
                <li>Improving and optimizing the Software (anonymized data only)</li>
                <li>Responding to your support inquiries</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>IMPORTANT:</strong> We do NOT sell, rent, or trade your data to third parties. Your data belongs to you.
              </p>

              <h3 className="text-base font-semibold mt-4">3. OTP & EMAIL COMMUNICATIONS</h3>
              <p className="text-sm text-muted-foreground">
                The Software sends the following types of emails:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>OTP authentication codes for secure login</li>
                <li>Project invitation emails to stakeholders</li>
                <li>Task assignment notifications</li>
                <li>Meeting minutes approval requests</li>
                <li>Document update notifications</li>
                <li>Apology request emails for meeting absences</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">4. DATA STORAGE</h3>
              <p className="text-sm text-muted-foreground">
                Data is stored securely in a cloud PostgreSQL database hosted on Render. The Company implements industry-standard 
                security measures including encryption in transit and at rest, regular backups, and access controls.
              </p>

              <h3 className="text-base font-semibold mt-4">5. YOUR RIGHTS UNDER KENYAN LAW</h3>
              <p className="text-sm text-muted-foreground">
                Under the Kenya Data Protection Act, 2019, you have the right to:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Access your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disclaimer & Liability */}
        <TabsContent value="disclaimer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel size={20} className="text-primary" />
                Disclaimer & Limitation of Liability
              </CardTitle>
              <CardDescription>Read carefully - This affects your legal rights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 prose prose-sm max-w-none">
              <div className="bg-destructive/10 rounded-lg p-4 mb-4 border-l-4 border-destructive">
                <p className="text-sm font-semibold mb-2 text-destructive">⚠️ IMPORTANT LIABILITY DISCLAIMER</p>
                <p className="text-xs text-muted-foreground">
                  THE SOFTWARE IS PROVIDED FOR INFORMATIONAL AND ASSISTANCE PURPOSES ONLY. FINITE ELEMENT DESIGNS LTD 
                  ACCEPTS NO LIABILITY FOR ANY DECISIONS MADE BASED ON INFORMATION PROVIDED BY THE SOFTWARE.
                </p>
              </div>

              <h3 className="text-base font-semibold mt-4">1. STAKEHOLDER INFORMATION DISCLAIMER</h3>
              <p className="text-sm text-muted-foreground">
                Information provided to stakeholders through the portal:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Is for informational purposes only</li>
                <li>Should not be relied upon as the sole basis for critical decisions</li>
                <li>May not reflect real-time site conditions</li>
                <li>Should be verified through independent means when necessary</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">2. MEETING MINUTES DISCLAIMER</h3>
              <p className="text-sm text-muted-foreground">
                Meeting minutes recorded in the Software:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Are accurate based on information provided by the minute-taker</li>
                <li>Should be reviewed and approved by authorized stakeholders</li>
                <li>Do not constitute legal documents unless explicitly stated</li>
                <li>May be subject to correction or amendment</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">3. OTP SECURITY DISCLAIMER</h3>
              <p className="text-sm text-muted-foreground">
                While OTP authentication provides enhanced security:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>You are responsible for keeping your email account secure</li>
                <li>OTP codes should never be shared with anyone</li>
                <li>The Company is not liable for unauthorized access due to compromised email accounts</li>
                <li>Report any suspicious OTP requests immediately</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stakeholder Terms - NEW TAB */}
        <TabsContent value="stakeholder">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Stakeholder Portal Terms
              </CardTitle>
              <CardDescription>Last updated: May 10, 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 prose prose-sm max-w-none">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                <p className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">🔐 STAKEHOLDER ACCESS AGREEMENT</p>
                <p className="text-xs text-muted-foreground">
                  This section applies specifically to stakeholders (clients, architects, engineers, consultants, and other 
                  third parties) who are invited to access project information through the Stakeholder Portal.
                </p>
              </div>

              <h3 className="text-base font-semibold mt-4">1. STAKEHOLDER DEFINITION</h3>
              <p className="text-sm text-muted-foreground">
                A "Stakeholder" is any individual or entity that has been invited by a project administrator to access 
                project information. Stakeholders may include but are not limited to:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Clients and property owners</li>
                <li>Architects and design professionals</li>
                <li>Structural, civil, mechanical, and electrical engineers</li>
                <li>Quantity surveyors and cost consultants</li>
                <li>Contractors and subcontractors</li>
                <li>Government officials and regulatory bodies</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">2. ACCESS RIGHTS & LIMITATIONS</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholders are granted access only to projects to which they have been explicitly invited. Stakeholder access includes:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Viewing project progress and status updates</li>
                <li>Reading meeting minutes, agendas, and decisions</li>
                <li>Downloading project documents, drawings, and reports</li>
                <li>Viewing financial summaries (contract sum, invoiced, paid, outstanding)</li>
                <li>Viewing project team members and their roles</li>
                <li>Tracking action items assigned to the stakeholder</li>
                <li>Updating status of assigned tasks</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Stakeholders may NOT:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Modify project data or financial records</li>
                <li>Delete any information</li>
                <li>Invite other users to the platform</li>
                <li>Access projects to which they are not explicitly invited</li>
                <li>Export data in bulk for commercial purposes</li>
                <li>Share login credentials or OTPs with any third party</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">3. MEETING MINUTES APPROVAL</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholders designated with approval authority may:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Review meeting minutes in "Pending Approval" status</li>
                <li>Approve minutes, making them official records</li>
                <li>Reject minutes with feedback for revision</li>
                <li>View version history of minute changes</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Approved minutes become binding records of project decisions. Stakeholders should review minutes carefully 
                before approving.
              </p>

              <h3 className="text-base font-semibold mt-4">4. OTP AUTHENTICATION FOR STAKEHOLDERS</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholders authenticate using OTP (One-Time Password) sent to their registered email:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>No permanent password is required or stored</li>
                <li>A new OTP is generated for each login attempt</li>
                <li>OTPs expire within 5 minutes for security</li>
                <li>Stakeholders must have access to their registered email to login</li>
                <li>Each stakeholder account uses a unique email address</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">5. CONFIDENTIALITY OBLIGATIONS</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholders agree to maintain the confidentiality of:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Financial information visible through the portal</li>
                <li>Project strategies and internal communications</li>
                <li>Document contents not publicly available</li>
                <li>Trade secrets and proprietary information</li>
                <li>Personal data of project team members</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">6. INVITATION & ACCESS TERMINATION</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholder access may be terminated:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>By the project administrator at any time without notice</li>
                <li>Automatically upon project completion or closure</li>
                <li>For violation of these terms</li>
                <li>Upon request of the stakeholder</li>
                <li>Due to account inactivity as determined by the Company</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">7. ATTENDANCE TRACKING</h3>
              <p className="text-sm text-muted-foreground">
                Meeting attendance is tracked in the "Matters Present" section. Stakeholders:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>May be marked as present or absent by the minute creator</li>
                <li>Will receive automated apology request emails if marked absent</li>
                <li>May respond to apology requests with explanation</li>
                <li>Should contact the minute creator to correct erroneous attendance marking</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">8. DATA RETENTION FOR STAKEHOLDERS</h3>
              <p className="text-sm text-muted-foreground">
                Stakeholder data (name, email, role, access logs) is retained:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>For the duration of project involvement</li>
                <li>As required for audit and compliance purposes</li>
                <li>User information is deleted upon request, subject to legal retention requirements</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Copyright & IP Protection */}
        <TabsContent value="copyright">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copyright size={20} className="text-primary" />
                Copyright & Intellectual Property Protection
              </CardTitle>
              <CardDescription>Protected under Kenyan and International Copyright Law</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 prose prose-sm max-w-none">
              <div className="bg-primary/5 rounded-lg p-4 mb-4 border-l-4 border-primary">
                <p className="text-sm font-semibold mb-2">© COPYRIGHT NOTICE</p>
                <p className="text-xs text-muted-foreground">
                  Copyright © {currentYear} Finite Element Designs Ltd. All rights reserved. This software is protected by 
                  copyright laws of the Republic of Kenya and international copyright treaties.
                </p>
              </div>

              <h3 className="text-base font-semibold mt-4">1. COPYRIGHT OWNERSHIP</h3>
              <p className="text-sm text-muted-foreground">
                The BOCHI Construction Suite, including but not limited to all source code, object code, architecture, 
                design, user interface, graphics, icons, documentation, and all intellectual property embodied therein, is the 
                exclusive property of <strong>Finite Element Designs Ltd</strong>, a company registered in the Republic of Kenya.
              </p>

              <h3 className="text-base font-semibold mt-4">2. USER DATA COPYRIGHT</h3>
              <p className="text-sm text-muted-foreground">
                All data entered by users remains the property of the user or their organization. The Company claims no 
                ownership over user-generated content, project data, financial records, or stakeholder information.
              </p>

              <h3 className="text-base font-semibold mt-4">3. PROHIBITED ACTIVITIES</h3>
              <p className="text-sm text-muted-foreground">
                The following activities are strictly prohibited:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Unauthorized copying, reproduction, or duplication of the Software</li>
                <li>Reverse engineering, decompilation, or disassembly</li>
                <li>Modification or creation of derivative works</li>
                <li>Unauthorized distribution or sublicensing</li>
                <li>Removal of copyright or proprietary notices</li>
                <li>Circumvention of technical protection measures</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Compliance */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                Legal Compliance & Regulatory Information
              </CardTitle>
              <CardDescription>Compliance with Kenyan and International Regulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    Applicable Kenyan Laws
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ Copyright Act, 2001 (No. 12 of 2001)</li>
                    <li>✓ Kenya Information and Communications Act, 1998</li>
                    <li>✓ Data Protection Act, 2019 (No. 24 of 2019)</li>
                    <li>✓ Computer Misuse and Cybercrimes Act, 2018</li>
                    <li>✓ Kenya Revenue Authority Tax Laws</li>
                    <li>✓ Employment Act, 2007</li>
                  </ul>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Key size={14} className="text-primary" />
                    Authentication & Security Compliance
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ OTP-based passwordless authentication</li>
                    <li>✓ Secure email communication channels</li>
                    <li>✓ Session timeout for inactive users</li>
                    <li>✓ Access logging for audit purposes</li>
                    <li>✓ Role-based access control (RBAC)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  Company Registration Information
                </p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Company Name:</strong> Finite Element Designs Ltd</li>
                  <li><strong>Business Permit:</strong> Valid and in good standing</li>
                  <li><strong>Physical Address:</strong> Deep Blue Building, Thika Road, Nairobi, Kenya</li>
                  <li><strong>Email:</strong> fedlimited@bochi.ke</li>
                  <li><strong>Phone:</strong> +254 772 041 005</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer with Legal Notice */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
            <Copyright size={12} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {currentYear} Finite Element Designs Ltd. All rights reserved.
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            BOCHI Construction Suite v2.1.0 | Protected under Kenyan and International Copyright Law<br/>
            Unauthorized reproduction, distribution, or modification of this software is strictly prohibited.<br/>
            OTP authentication and Stakeholder Portal features are protected under these terms.
          </p>
        </div>
      </div>
    </div>
  );
}