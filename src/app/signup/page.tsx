"use client";
import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import ConvomateLogo from "@/components/ConvomateLogo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const Signup: React.FC = () => {
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast.success("User created successfully");
        // Redirect to signin page after successful signup
        setTimeout(() => {
          window.location.href = "/signin";
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create user");
      }
    } catch {
      toast.error("An error occurred during signup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800/95 border-gray-700/30 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ConvomateLogo size={160} variant="light" />
          </div>
          <CardTitle className="text-2xl font-semibold text-white tracking-tight">
            Create Account
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Join Convomate to start your AI-powered conversations
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          className="pl-10 bg-gray-900/80 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:bg-gray-800/90"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-300">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          {...field}
                          className="pl-10 bg-gray-900/80 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:bg-gray-800/90"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          {...field}
                          className="pl-10 bg-gray-900/80 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:bg-gray-800/90"
                          placeholder="Create a strong password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-400 to-cyan-400 text-white font-semibold hover:from-green-500 hover:to-cyan-500 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(74,222,128,0.4)] transition-all duration-200"
                size="lg"
              >
                Create Account
              </Button>
            </form>
          </Form>

          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Sign in
              </Link>
            </p>

            <Button
              asChild
              variant="outline"
              className="bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-600/90"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
