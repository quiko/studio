
"use client";

import type { ArtistContractItem } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, User, FileCheck2, FileClock, FileX2, Star, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ArtistContractCardProps {
  contract: ArtistContractItem;
}

const statusIconsAndColors: Record<ArtistContractItem['status'], { icon: React.ElementType, color: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  'Pending Review': { icon: FileClock, color: 'text-yellow-500', variant: 'outline' },
  'Accepted': { icon: FileCheck2, color: 'text-green-500', variant: 'default' },
  'Declined': { icon: FileX2, color: 'text-red-500', variant: 'destructive' },
  'Fulfilled': { icon: Star, color: 'text-blue-500', variant: 'secondary' },
  'Cancelled': { icon: FileX2, color: 'text-gray-500', variant: 'outline'},
};

export function ArtistContractCard({ contract }: ArtistContractCardProps) {
  const { icon: StatusIcon, color: statusColor, variant: badgeVariant } = statusIconsAndColors[contract.status];
  const proposedDate = new Date(contract.dateProposed);
  const formattedProposedDate = !isNaN(proposedDate.getTime()) ? format(proposedDate, "PPP") : "Invalid Date";

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{contract.eventName}</CardTitle>
          <Badge variant={badgeVariant} className="ml-2 whitespace-nowrap">
            <StatusIcon className={`mr-1 h-3.5 w-3.5 ${statusColor}`} />
            {contract.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center pt-1">
          <User className="mr-2 h-4 w-4 text-primary" /> {contract.organizerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Proposed: {formattedProposedDate}</span>
        </div>
         <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground/80">Scope:</p>
          <p className="line-clamp-2">{contract.scopeOfWork}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{contract.eventName}</DialogTitle>
              <DialogDescription>
                Contract with {contract.organizerName} - Proposed on {formattedProposedDate}\
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <Badge variant={badgeVariant} className="w-fit">
                     <StatusIcon className={`mr-1.5 h-4 w-4 ${statusColor}`} />
                    {contract.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Scope of Work:</span>
                  <p className="text-sm">{contract.scopeOfWork}</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Payment Amount:</span>
                  <p className="text-sm font-semibold">{contract.paymentAmount}</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Payment Terms:</span>
                  <p className="text-sm">{contract.paymentTerms}</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Full Terms:</span>
                  <pre className="text-xs bg-muted/50 p-3 rounded whitespace-pre-wrap font-code">
                    {contract.contractTerms}
                  </pre>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              {/* Action buttons like "Accept" or "Decline" could go here in a future iteration */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
