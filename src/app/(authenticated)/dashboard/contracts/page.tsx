
"use client";

import CreateContractForm from "@/components/forms/CreateContractForm"; 
import { PageHeader } from "@/components/ui/PageHeader";
import { UserType, MOCK_ARTIST_CONTRACTS, type GeneratedContractData, type GeneratedContractStatus } from "@/lib/constants";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileWarning, Info, FileText, ListChecks, Edit3, Send, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArtistContractCard } from "@/components/cards/ArtistContractCard";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


function OrganizerContractItemCard({ contract }: { contract: GeneratedContractData }) {
  const { organizerSignsContract } = useUser();
  const { toast } = useToast();

  const handleSignAndSend = () => {
    if (contract.status === 'draft') {
      organizerSignsContract(contract.id);
      toast({
        title: "Contract Signed by You",
        description: `The contract for "${contract.eventName}" is now marked as signed and pending artist signature.`,
      });
    }
  };

  const getStatusBadgeVariant = (status: GeneratedContractStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "draft":
        return "outline";
      case "pending_artist_signature":
        return "secondary"; // Using secondary for pending states
      case "signed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: GeneratedContractStatus) => {
    switch (status) {
      case "draft":
        return <Edit3 className="mr-1 h-3 w-3" />;
      case "pending_artist_signature":
        return <Clock className="mr-1 h-3 w-3" />;
      case "signed":
        return <CheckCircle2 className="mr-1 h-3 w-3" />;
      case "cancelled":
        return <AlertCircle className="mr-1 h-3 w-3" />;
      default:
        return <Info className="mr-1 h-3 w-3" />;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline">{contract.eventName}</CardTitle>
          <Badge variant={getStatusBadgeVariant(contract.status)} className="capitalize">
            {getStatusIcon(contract.status)}
            {contract.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <CardDescription>For: {contract.artistName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p><span className="font-medium">Date:</span> {format(new Date(contract.eventDate), "PPP")}</p>
        <p><span className="font-medium">Location:</span> {contract.eventLocation}</p>
        <p><span className="font-medium">Fee:</span> {contract.fee}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={contract.status !== 'draft'}>
          <Edit3 className="mr-1 h-3 w-3" /> Edit
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSignAndSend}
          disabled={contract.status !== 'draft'}
        >
          <Send className="mr-1 h-3 w-3" /> 
          {contract.status === 'draft' ? 'Sign & Send' : 'Awaiting Artist'}
        </Button>
         <Button variant="destructive" size="sm" disabled={contract.status === 'signed' || contract.status === 'pending_artist_signature'}>
          <Trash2 className="mr-1 h-3 w-3" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}


export default function ContractsPage() {
  const { userRole, organizerContracts } = useUser(); 

  return (
    <div>
      <PageHeader
        title="Contract Management"
        description={
          userRole === UserType.ORGANIZER
            ? "Create and manage performance agreements."
            : "View and manage your agreements."
        }
      />

      {userRole === UserType.ORGANIZER && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary"/>Create New Contract</CardTitle>
              <CardDescription>
                Fill in the details to draft a new performance agreement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateContractForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary"/>My Contracts</CardTitle>
                <CardDescription>Contracts you have created. Sign and send drafts, or view their status.</CardDescription>
            </CardHeader>
            <CardContent>
                {organizerContracts.length === 0 ? (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle className="font-headline">No Contracts Yet</AlertTitle>
                        <AlertDescription>
                        Use the form above to create your first contract.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                        {organizerContracts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(contract => (
                            <OrganizerContractItemCard key={contract.id} contract={contract} />
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
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
