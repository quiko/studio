
"use client";

import CreateContractForm from "@/components/forms/CreateContractForm"; 
import { PageHeader } from "@/components/ui/PageHeader";
import { UserType, MOCK_ARTIST_CONTRACTS, type GeneratedContractData, type GeneratedContractStatus, type ArtistContractItem } from "@/lib/constants"; // Added ArtistContractItem
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileWarning, Info, FileText, ListChecks, Edit3, Send, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArtistContractCard } from "@/components/cards/ArtistContractCard";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateContractPdf } from "@/lib/pdfGenerator";
import { uploadPdfToFirebaseStorage, updateContractPdfUrl } from "@/lib/firebaseUtils";
import { useState } from "react";
import PdfPreviewModal from "@/components/modals/PdfPreviewModal";


function OrganizerContractItemCard({ contract }: { contract: GeneratedContractData }) {
  const { organizerSignsContract } = useUser();
  const { toast } = useToast();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [currentPdfBlob, setCurrentPdfBlob] = useState<Blob | null>(null);

  const handleGeneratePreview = async () => {
    const pdf = await generateContractPdf({
      ...contract,
      fee: parseFloat(contract.fee), // Ensure fee is a number if your pdfGenerator expects it
      clauses: contract.clauses.split('\n'), 
    });
    const previewUrl = URL.createObjectURL(pdf);
    setCurrentPdfBlob(pdf);
    setPreviewPdfUrl(previewUrl);
    setShowPreviewModal(true);
  };
  
  const handleConfirmAndSend = async () => {
    if (!currentPdfBlob || !contract.id) {
        toast({
            title: "Error",
            description: "PDF blob or contract ID is missing.",
            variant: "destructive",
        });
        return;
    }
  
    try {
      // Note: The original updateContractPdfUrl was designed for "contracts/{contractId}"
      // The current mock data for organizerContracts does not persist to Firestore
      // so updateContractPdfUrl would fail unless these contracts are also in a 'contracts' collection.
      // For now, we'll simulate the upload and update local state for the demo.
      // In a real app, ensure contract.id refers to a valid Firestore document.
      const downloadUrl = await uploadPdfToFirebaseStorage(currentPdfBlob, `${contract.eventName}_${contract.id}.pdf`);
      
      // This part would ideally update the Firestore document:
      // await updateContractPdfUrl(contract.id, downloadUrl); 
      // For mock:
      console.log(`Simulated: PDF for contract ${contract.id} uploaded to ${downloadUrl}`);
      
      organizerSignsContract(contract.id); 
      toast({
        title: "Contract Sent",
        description: "PDF uploaded and contract marked as signed.",
      });
      setShowPreviewModal(false);
    } catch (error) {
      console.error("Error confirming and sending contract:", error);
      toast({
        title: "Upload Failed",
        description: "Something went wrong uploading the contract PDF.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: GeneratedContractStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "draft":
        return "outline";
      case "pending_artist_signature":
        return "secondary"; 
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
    <>
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
          onClick={handleGeneratePreview}
          disabled={contract.status !== 'draft'}
        >
          <Send className="mr-1 h-3 w-3" /> 
          {contract.status === 'draft' ? 'Sign & Send' : 'View Sent'} 
        </Button>
         <Button variant="destructive" size="sm" disabled={contract.status === 'signed' || contract.status === 'pending_artist_signature'}>
          <Trash2 className="mr-1 h-3 w-3" /> Delete
        </Button>
      </CardFooter>
    </Card>
    <PdfPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        pdfUrl={previewPdfUrl}
        onConfirm={handleConfirmAndSend}
    />
    </>
  )
}


export default function ContractsPage() {
  const { userRole, organizerContracts, firebaseUser: currentUser } = useUser(); 

  const transformGeneratedToArtistContractItem = (gc: GeneratedContractData): ArtistContractItem => {
    let artistFacingStatus: ArtistContractItem['status'];
    switch (gc.status) {
      case 'pending_artist_signature':
        artistFacingStatus = 'Pending Review';
        break;
      case 'signed':
        artistFacingStatus = 'Accepted';
        break;
      // case 'completed': // Assuming 'completed' in GeneratedContractData means 'Fulfilled' for artist
      //   artistFacingStatus = 'Fulfilled';
      //   break;
      case 'cancelled':
        artistFacingStatus = 'Cancelled';
        break;
      default:
        // For other statuses like 'draft', 'pending_organizer_signature', etc.,
        // which might not be directly shown to the artist with these specific labels or actions in ArtistContractCard.
        // Defaulting to 'Pending Review' or a more generic status if appropriate.
        // Or filter them out before mapping if ArtistContractCard cannot represent them.
        artistFacingStatus = 'Pending Review'; // Or some other sensible default for display
    }

    return {
      id: gc.id,
      eventName: gc.eventName,
      organizerName: gc.organizerName,
      dateProposed: format(new Date(gc.createdAt), "PPP"), // Using createdAt as dateProposed
      scopeOfWork: gc.clauses, // Assuming clauses contain the scope
      paymentAmount: gc.fee,
      paymentTerms: "Refer to contract clauses for payment terms.", // Placeholder, or could be extracted
      contractTerms: gc.clauses,
      status: artistFacingStatus,
    };
  };

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
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary"/>My Agreements</CardTitle>
                <CardDescription>Contracts you are involved in as an artist. Review and sign pending agreements.</CardDescription>
            </CardHeader>
            <CardContent>
              {organizerContracts.filter(c => c.artistId === currentUser?.uid && (c.status === 'pending_artist_signature' || c.status === 'signed' || c.status === 'completed' || c.status === 'cancelled')).length === 0 ? (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle className="font-headline">No Contracts Yet</AlertTitle>
                  <AlertDescription>
                    You currently don't have any contracts. Contracts shared by organizers will appear here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  {organizerContracts
                    .filter(c => c.artistId === currentUser?.uid && (c.status === 'pending_artist_signature' || c.status === 'signed' || c.status === 'completed' || c.status === 'cancelled'))
                    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((contract) => (
                      <ArtistContractCard key={contract.id} contract={transformGeneratedToArtistContractItem(contract)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

