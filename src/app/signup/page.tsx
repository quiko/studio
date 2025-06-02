
import SignUpForm from '@/components/forms/SignUpForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { APP_NAME } from '@/lib/constants';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 grid-background">
      <div className="flex items-center gap-2 mb-8">
        <LogoIcon className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">{APP_NAME}</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join {APP_NAME} today to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
