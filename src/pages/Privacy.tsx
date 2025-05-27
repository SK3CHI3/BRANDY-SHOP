import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Eye, Lock, Database, Share, Settings } from 'lucide-react'

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Personal information you provide when creating an account (name, email, phone number)',
        'Payment information processed securely through our payment partners',
        'Usage data including pages visited, time spent, and interactions with our platform',
        'Device information such as IP address, browser type, and operating system'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our services and process your transactions',
        'To communicate with you about your account, orders, and platform updates',
        'To improve our platform and develop new features based on user feedback',
        'To comply with legal obligations and protect against fraudulent activities'
      ]
    },
    {
      icon: Share,
      title: 'Information Sharing',
      content: [
        'We do not sell, trade, or rent your personal information to third parties',
        'We may share information with service providers who help us operate our platform',
        'Artists\' public profiles and artwork are visible to all platform users',
        'We may disclose information when required by law or to protect our rights'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'We use industry-standard encryption to protect your personal information',
        'Payment data is processed through PCI-compliant payment processors',
        'Regular security audits and updates to protect against vulnerabilities',
        'Access to personal data is restricted to authorized personnel only'
      ]
    },
    {
      icon: Settings,
      title: 'Your Rights',
      content: [
        'Access and review the personal information we have about you',
        'Request corrections to inaccurate or incomplete information',
        'Request deletion of your personal information (subject to legal requirements)',
        'Opt-out of marketing communications at any time'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Commitment to Privacy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Brandy Shop, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using our services, you consent to the collection and use of information in 
              accordance with this policy. We encourage you to read this policy carefully and 
              contact us if you have any questions.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies and Tracking</h3>
              <p className="text-gray-600 text-sm">
                We use cookies and similar tracking technologies to enhance your experience on our 
                platform. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Third-Party Services</h3>
              <p className="text-gray-600 text-sm">
                Our platform integrates with third-party services for payments, analytics, and 
                customer support. These services have their own privacy policies that govern 
                their use of your information.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
              <p className="text-gray-600 text-sm">
                We retain your personal information for as long as necessary to provide our services 
                and comply with legal obligations. You may request deletion of your data at any time.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">International Transfers</h3>
              <p className="text-gray-600 text-sm">
                Your information may be transferred to and processed in countries other than Kenya. 
                We ensure appropriate safeguards are in place to protect your information.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Children's Privacy</h3>
              <p className="text-gray-600 text-sm">
                Our services are not intended for children under 13. We do not knowingly collect 
                personal information from children under 13 without parental consent.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Changes to This Policy</h3>
              <p className="text-gray-600 text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "last updated" date.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Questions About Privacy?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: privacy@brandyshop.co.ke</p>
              <p>Phone: +254 700 000 000</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default Privacy
