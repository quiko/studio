
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
import { UserType, APP_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { Building, User, UserPlus, Loader2 } from 'lucide-react';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password confirmation is required."}),
  userType: z.nativeEnum(UserType, {
    required_error: "You must select an account type.",
  }).refine(val => val !== UserType.NONE, {message: "Please select a valid account type."}),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpForm() {
  const { setUserRoleState } = useUser(); 
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: undefined, 
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    if (!values.userType || values.userType === UserType.NONE) { // Double check, though Zod refine should catch it
        toast({
            title: "Sign Up Failed",
            description: "Please select a valid account type.",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const { user: firebaseUser } = userCredential;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: values.fullName,
        role: values.userType,
        createdAt: serverTimestamp(), // Use serverTimestamp for consistent server-side timestamp
      });
      setUserRoleState(values.userType); 

      toast({
          title: "Account Created!",
          description: `Welcome to ${APP_NAME}, ${values.fullName}! Redirecting to dashboard...`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') { // Handle specific Firebase Auth errors
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. It must be at least 6 characters.";
      }
      toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I want to sign up as:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value as UserType)}
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
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
