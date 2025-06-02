
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { FilePlus2, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import type { GeneratedContractData } from "@/lib/constants";

const formSchema = z.object({
  organizerName: z.string().min(1, { message: "Organizer name is pre-filled." }), // Should be pre-filled
  artistName: z.string().min(2, { message: "Artist name is required." }),
  eventName: z.string().min(3, { message: "Event name is required." }),
  eventDate: z.date({ required_error: "Event date is required." }),
  eventLocation: z.string().min(3, { message: "Event location is required." }),
  fee: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, { message: "Invalid fee format (e.g., $1,000 or 1000.00)." }),
  clauses: z.string().min(10, { message: "At least some basic terms/clauses are required." }),
});

type CreateContractFormValues = z.infer<typeof formSchema>;

export default function CreateContractForm() {
  const { firebaseUser, addOrganizerContract } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizerName: firebaseUser?.displayName || firebaseUser?.email || "",
      artistName: "",
      eventName: "",
      eventDate: undefined,
      eventLocation: "",
      fee: "",
      clauses: "Standard performance terms apply. Payment due upon completion. Cancellation policy: 14 days notice.",
    },
  });
  
  useEffect(() => {
    if (firebaseUser) {
      form.setValue("organizerName", firebaseUser.displayName || firebaseUser.email || "");
    }
  }, [firebaseUser, form]);


  async function onSubmit(values: CreateContractFormValues) {
    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a contract.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    
    const newContractData: Omit<GeneratedContractData, 'id' | 'createdAt' | 'status'> = {
        organizerId: firebaseUser.uid,
        organizerName: values.organizerName,
        artistName: values.artistName,
        // artistId will be undefined for now
        eventName: values.eventName,
        eventDate: values.eventDate.toISOString(),
        eventLocation: values.eventLocation,
        fee: values.fee,
        clauses: values.clauses,
    };

    try {
      // For now, add to local state via UserContext
      addOrganizerContract(newContractData);
      
      toast({
        title: "Contract Draft Saved",
        description: `Draft for "${values.eventName}" with ${values.artistName} has been saved.`,
      });
      form.reset({
        ...form.getValues(), // Keep organizer name
        artistName: "",
        eventName: "",
        eventDate: undefined,
        eventLocation: "",
        fee: "",
        clauses: "Standard performance terms apply. Payment due upon completion. Cancellation policy: 14 days notice.",
      }); // Reset form after successful submission
    } catch (error) {
        console.error("Error creating contract draft:", error);
        toast({ title: "Error", description: "Could not save contract draft.", variant: "destructive"})
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="organizerName" render={({ field }) => (
            <FormItem><FormLabel>Organizer Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>
        )} />
        
        <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="artistName" render={({ field }) => (
            <FormItem><FormLabel>Artist Name</FormLabel><FormControl><Input placeholder="Enter Artist's Full Name or Stage Name" {...field} /></FormControl><FormDescription>Artist ID will be linked if they are on the platform.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="eventName" render={({ field }) => (
            <FormItem><FormLabel>Event Name</FormLabel><FormControl><Input placeholder="e.g., Annual Charity Gala" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <FormField control={form.control} name="eventDate" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Event Date</FormLabel><Popover>
                <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick event date</span>}
                    </Button></FormControl></PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} /></PopoverContent>
            </Popover><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="eventLocation" render={({ field }) => (
            <FormItem><FormLabel>Event Location</FormLabel><FormControl><Input placeholder="e.g., The Grand Ballroom, Cityville" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fee" render={({ field }) => (
            <FormItem><FormLabel>Performance Fee</FormLabel><FormControl><Input placeholder="$1,200.00" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <FormField control={form.control} name="clauses" render={({ field }) => (
        <FormItem><FormLabel>Terms & Clauses</FormLabel><FormControl><Textarea placeholder="Specify payment terms, cancellation policy, technical rider summary, etc." {...field} rows={6} /></FormControl><FormDescription>Detail the key terms of the agreement.</FormDescription><FormMessage /></FormItem>
        )} />
        
        <Button type="submit" disabled={isLoading || !firebaseUser} className="w-full sm:w-auto">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Draft Contract
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
            Note: This saves a draft. PDF generation, e-signatures, and sending to artist will be available in a future step.
        </p>
      </form>
    </Form>
  );
}
