import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Shield, Users, CreditCard } from 'lucide-react'

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Terms of Use',
      content: [
        'By accessing and using Brandy Shop, you accept and agree to be bound by the terms and provision of this agreement.',
        'You must be at least 18 years old to use our services or have parental consent.',
        'You agree to use our platform only for lawful purposes and in accordance with these Terms.',
        'We reserve the right to modify these terms at any time with notice to users.'
      ]
    },
    {
      icon: Users,
      title: 'User Accounts',
      content: [
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You agree to provide accurate and complete information when creating an account.',
        'You are responsible for all activities that occur under your account.',
        'We reserve the right to suspend or terminate accounts that violate our terms.'
      ]
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: [
        'All designs and content on our platform are protected by intellectual property rights.',
        'Artists retain ownership of their original designs while granting us license to display and sell them.',
        'Users may not reproduce, distribute, or create derivative works without permission.',
        'We respect intellectual property rights and will respond to valid DMCA notices.'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payment & Refunds',
      content: [
        'All payments are processed securely through our payment partners.',
        'Prices are displayed in Kenyan Shillings (KSh) and include applicable taxes.',
        'Refunds are available within 30 days of purchase for unused digital products.',
        'Physical products may be returned within 14 days in original condition.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using our platform
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Welcome to Brandy Shop</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the Brandy Shop platform, 
              website, and services. By accessing or using our platform, you agree to be bound 
              by these Terms. If you disagree with any part of these terms, then you may not 
              access our service.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-orange-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Terms */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Artist Terms</h3>
              <p className="text-gray-600 text-sm">
                Artists who join our platform agree to additional terms regarding commission rates, 
                content guidelines, and payout schedules. These terms are provided during the 
                artist onboarding process.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Prohibited Uses</h3>
              <p className="text-gray-600 text-sm">
                You may not use our platform for any illegal activities, to infringe on others' 
                rights, to upload malicious content, or to engage in any activity that could 
                harm our platform or users.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
              <p className="text-gray-600 text-sm">
                Brandy Shop shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of our platform.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Governing Law</h3>
              <p className="text-gray-600 text-sm">
                These Terms shall be governed by and construed in accordance with the laws of Kenya, 
                without regard to its conflict of law provisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Questions About These Terms?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: legal@brandyshop.co.ke</p>
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

export default Terms
