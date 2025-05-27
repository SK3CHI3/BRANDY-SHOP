import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Palette, 
  Globe, 
  Award,
  Target,
  Eye,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  const stats = [
    { label: 'Active Artists', value: '500+', icon: Users },
    { label: 'Designs Created', value: '10,000+', icon: Palette },
    { label: 'Happy Customers', value: '5,000+', icon: Heart },
    { label: 'Countries Served', value: '15+', icon: Globe }
  ]

  const values = [
    {
      icon: Palette,
      title: 'Creativity First',
      description: 'We believe in the power of creativity to transform lives and communities. Every design tells a story.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Our platform is built by artists, for artists. We foster a supportive community where creativity thrives.'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We maintain the highest standards in design quality, customer service, and product delivery.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Connecting Kenyan artists with the world, showcasing our rich cultural heritage globally.'
    }
  ]

  const team = [
    {
      name: 'Sarah Wanjiku',
      role: 'Founder & CEO',
      image: '/placeholder.svg',
      bio: 'Passionate about empowering African artists and promoting cultural heritage through design.'
    },
    {
      name: 'John Mwangi',
      role: 'Head of Artist Relations',
      image: '/placeholder.svg',
      bio: 'Former artist turned advocate, helping creators build sustainable careers through art.'
    },
    {
      name: 'Grace Akinyi',
      role: 'Creative Director',
      image: '/placeholder.svg',
      bio: 'Award-winning designer with 10+ years experience in African contemporary art.'
    }
  ]

  const milestones = [
    { year: '2020', event: 'Brandy Shop founded with 10 local artists' },
    { year: '2021', event: 'Reached 100 artists and launched custom design studio' },
    { year: '2022', event: 'Expanded to serve customers across East Africa' },
    { year: '2023', event: 'Launched international shipping and artist mentorship program' },
    { year: '2024', event: 'Celebrating 500+ artists and 10,000+ designs created' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About Brandy Shop</h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Empowering Kenyan artists to share their creativity with the world while preserving 
              and celebrating our rich cultural heritage through beautiful, meaningful designs.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/artists">
                <Button size="lg" variant="secondary">
                  Meet Our Artists
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600">
                  Explore Designs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To create a thriving ecosystem where Kenyan artists can showcase their talents, 
                earn sustainable income, and share their cultural stories with a global audience 
                through high-quality, meaningful designs.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the leading platform for African art and design, fostering creativity, 
                preserving cultural heritage, and connecting artists with opportunities that 
                transform their passion into prosperity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the way we serve our community of artists and customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                  <value.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to empowering artists and celebrating African creativity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square bg-gray-200">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600">Key milestones in our mission to empower African artists</p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">{milestone.year}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Creative Community</h2>
          <p className="text-xl text-purple-100 mb-8">
            Whether you're an artist looking to showcase your work or a customer seeking unique designs, 
            we'd love to have you as part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/artists">
              <Button size="lg" variant="secondary">
                <Palette className="h-4 w-4 mr-2" />
                Become an Artist
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Star className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About
