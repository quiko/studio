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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import type { EventItem } from "@/lib/constants";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, {message: "Description must be less than 500 characters."}),
  date: z.date({ required_error: "Event date is required." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
  budget: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, { message: "Invalid budget format (e.g., $1,000 or 1000.00)." }),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  event?: EventItem; // For editing
}

export default function EventForm({ event }: EventFormProps) {
  const { addEvent, updateEvent } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? { ...event, date: new Date(event.date) }
      : {
          title: "",
          description: "",
          date: undefined,
          location: "",
          budget: "",
        },
  });

  async function onSubmit(values: EventFormValues) {
    setIsLoading(true);
    const eventData = { ...values, date: values.date.toISOString() };
    
    try {
      if (event) {
        updateEvent({ ...eventData, id: event.id });
        toast({ title: "Event Updated", description: `"${values.title}" has been successfully updated.` });
      } else {
        addEvent(eventData);
        toast({ title: "Event Created", description: `"${values.title}" has been successfully created.` });
      }
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Failed to save event:", error);
      toast({ title: "Error", description: "Failed to save event. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Music Festival" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your event..." {...field} rows={5}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Central Park, NYC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., $5000 or 1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {event ? "Save Changes" : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
