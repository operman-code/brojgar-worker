import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      const user = data.user || data; // server returns { user }
      toast({ title: "Signed in", description: "Redirecting to your dashboard..." });
      setTimeout(() => {
        if (user.userType === "worker") {
          setLocation(`/worker-dashboard/${user.id}`);
        } else {
          setLocation(`/business-dashboard/${user.id}`);
        }
      }, 800);
    },
    onError: (error: any) => {
      toast({ title: "Login failed", description: error.message || "Invalid credentials", variant: "destructive" });
    },
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: LoginData) => {
    setIsSubmitting(true);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
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
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Button variant="link" className="p-0" onClick={() => setLocation('/register/worker')}>
                Create one
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
