
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MicVocal, Users, Edit3, Search, FileText, MessageSquare, Wand2, CalendarPlus, Palette, DollarSign, CheckCircle, Lightbulb, Rocket, BarChart } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Link href="/" className="mb-8 inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <PageHeader
        title={`How ${APP_NAME} Works`}
        description={`Understand how our platform connects artists and event organizers, empowering creativity and collaboration.`}
      />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <MicVocal className="mr-3 h-7 w-7 text-primary" />
              For Artists: Showcase Your Talent & Find Opportunities
            </CardTitle>
            <CardDescription>
              Amplify your reach, manage your bookings, and create amazing music.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Edit3 className="mr-2 h-5 w-5 text-accent" />Sign-up and Profile</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Quickly sign up and build an attractive artist profile.</li>
                <li>Highlight your bio, musical genres, and indicative rates.</li>
                <li>Showcase your talent with audio & video portfolio links and a professional profile image.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Search className="mr-2 h-5 w-5 text-accent" />Visibility and Opportunities</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Get discovered by a wide range of event organizers.</li>
                <li>Receive notifications for relevant event opportunities (future feature).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><MessageSquare className="mr-2 h-5 w-5 text-accent" />Interaction and Contracts</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Communicate directly with organizers via integrated messaging.</li>
                <li>View and manage (mock) contracts shared by organizers.</li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Wand2 className="mr-2 h-5 w-5 text-accent" />AI Music Studio</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Compose original music with AI assistance.</li>
                <li>Experiment with various genres, moods, and instruments.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Rocket className="mr-2 h-5 w-5 text-accent" />Key Benefits for Artists</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Increased visibility and access to more opportunities.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Simplified communication and (future) booking management.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Creative AI tools to enhance your music production.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Streamlined contract viewing process.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Users className="mr-3 h-7 w-7 text-primary" />
              For Event Organizers: Discover & Book Amazing Talent
            </CardTitle>
            <CardDescription>
              Find the perfect artists for your events efficiently and creatively.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><CalendarPlus className="mr-2 h-5 w-5 text-accent" />Sign-up and Event Posting</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Easily sign up and start creating your events.</li>
                <li>Effectively post event details: title, description, date, location, and budget.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Palette className="mr-2 h-5 w-5 text-accent" />Artist Discovery</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Browse and filter a diverse range of artist profiles by name or genre.</li>
                <li>Utilize AI Artist Suggestions to get tailored recommendations based on your event needs.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><MessageSquare className="mr-2 h-5 w-5 text-accent" />Interaction and Selection</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Contact artists directly through our secure messaging system.</li>
                <li>Manage proposals and select your preferred artists (future feature).</li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><FileText className="mr-2 h-5 w-5 text-accent" />Management Tools</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li>Generate draft contract templates for performances.</li>
                <li>Communicate efficiently with selected artists.</li>
                <li>(Future features: Payment processing, advanced event management tools).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Lightbulb className="mr-2 h-5 w-5 text-accent" />Key Benefits for Organizers</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Access to a large and diverse pool of musical talent.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />AI-powered matchmaking for efficient artist discovery.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Simplification of the booking and event creation process.</li>
                <li><CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />Streamlined communication and contract generation.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <Link href="/signup">
          <Button size="lg">
            Join {APP_NAME} Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
