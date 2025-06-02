
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser } from '@/contexts/UserContext';
import { UserType } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { Building, User, LogIn } from 'lucide-react';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')), // Dummy field
  password: z.string().min(1, { message: "Password is required." }).optional().or(z.literal('')), // Dummy field
  userType: z.nativeEnum(UserType, {
    required_error: "You must select a user type.",
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { setUserType } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "", // Dummy
      password: "", // Dummy
      userType: undefined,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!values.userType || values.userType === UserType.NONE) {
        toast({
            title: "Login Failed",
            description: "Please select a valid user type.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    setUserType(values.userType);
    toast({
        title: "Login Successful!",
        description: `Welcome back, ${values.userType}!`,
    });
    router.push('/dashboard');
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Demo)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>This is a demo. No actual email check is performed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password (Demo)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
               <FormDescription>This is a demo. No actual password check.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Log in as:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={UserType.ORGANIZER} id="organizer" />
                    </FormControl>
                    <FormLabel htmlFor="organizer" className="font-normal flex items-center">
                      <Building className="mr-2 h-5 w-5 text-muted-foreground" />
                      Event Organizer
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={UserType.ARTIST} id="artist" />
                    </FormControl>
                    <FormLabel htmlFor="artist" className="font-normal flex items-center">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      Artist
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : <><LogIn className="mr-2 h-5 w-5" /> Log In</>}
        </Button>
      </form>
    </Form>
  );
}
