import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Construction } from 'lucide-react';
import Image from 'next/image';

export default function MessagesPage() {
  return (
    <div>
      <PageHeader
        title="Messages"
        description="Communicate with artists and event organizers."
      />
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-center">
            <MessageSquare className="mr-2 h-6 w-6 text-primary" />
            Integrated Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <Construction className="h-24 w-24 text-accent" />
          <p className="text-xl text-muted-foreground">
            This feature is currently under construction.
          </p>
          <p className="max-w-md">
            Soon, you'll be able to seamlessly negotiate booking terms and chat directly within MaestroAI.
            Stay tuned for updates!
          </p>
          <div className="relative w-full max-w-sm h-64 mt-4">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Messaging interface concept" 
              layout="fill" 
              objectFit="contain"
              data-ai-hint="chat interface"
            />
          </div>
          <Button variant="outline" disabled>Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
