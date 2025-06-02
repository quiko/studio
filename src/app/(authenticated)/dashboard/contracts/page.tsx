
"use client";

import ContractGeneratorForm from "@/components/forms/ContractGeneratorForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserType, MOCK_ARTIST_CONTRACTS } from "@/lib/constants";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, Info, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArtistContractCard } from "@/components/cards/ArtistContractCard";


export default function ContractsPage() {
  const { userRole } = useUser();

  return (
    <div>
      <PageHeader
        title="Contract Management"
        description={
          userRole === UserType.ORGANIZER
            ? "Generate draft contracts for your collaborations."
            : "View and manage your agreements."
        }
      />

      {userRole === UserType.ORGANIZER && (
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
      )}

      {userRole === UserType.ARTIST && (
        <div>
          {MOCK_ARTIST_CONTRACTS.length === 0 ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle className="font-headline">No Contracts Yet</AlertTitle>
              <AlertDescription>
                You currently don't have any contracts. Contracts shared by organizers will appear here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_ARTIST_CONTRACTS.map((contract) => (
                <ArtistContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
