"use client";

import ContractGeneratorForm from "@/components/forms/ContractGeneratorForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserType } from "@/lib/constants";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction, FileWarning } from "lucide-react";
import Image from 'next/image';

export default function ContractsPage() {
  const { userType } = useUser();

  return (
    <div>
      <PageHeader
        title="Contract Management"
        description={
          userType === UserType.ORGANIZER
            ? "Generate draft contracts for your collaborations."
            : "View and manage your agreements."
        }
      />

      {userType === UserType.ORGANIZER ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Contract Template Generator</CardTitle>
            <CardDescription>
              Fill in the details to generate a basic performance agreement template.
              <br />
              <span className="text-xs text-destructive flex items-center mt-1">
                <FileWarning className="h-3 w-3 mr-1" /> This is a simplified template for demonstration and not legal advice.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractGeneratorForm />
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="font-headline">Your Contracts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <Construction className="h-24 w-24 text-accent" />
            <p className="text-xl text-muted-foreground">
              Artist contract management is under development.
            </p>
            <p className="max-w-md">
              Soon, you'll be able to view contracts shared by organizers and manage your agreements here.
            </p>
            <div className="relative w-full max-w-sm h-64 mt-4">
             <Image 
                src="https://placehold.co/600x400.png" 
                alt="Contract document concept" 
                layout="fill" 
                objectFit="contain"
                data-ai-hint="document contract"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
