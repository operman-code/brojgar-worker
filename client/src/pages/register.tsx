import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, HardHat, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.string().min(1, "Location is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // Worker specific
  skills: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  // Business specific
  businessName: z.string().optional(),
  businessType: z.string().optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

const skillOptions = ["Construction", "Delivery", "Cleaning", "Cooking", "Plumbing", "Electrical", "Painting", "Gardening"];
const areaOptions = ["Mumbai Central", "Delhi NCR", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"];
const experienceLevels = ["Beginner (0-1 years)", "Intermediate (1-3 years)", "Experienced (3+ years)"];
const businessTypes = ["Restaurant", "Construction", "Retail Store", "Service Business", "Manufacturing", "Other"];

export default function Register() {
  const { userType } = useParams<{ userType: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      skills: [],
      experienceLevel: "",
      businessName: "",
      businessType: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const payload = {
        ...data,
        userType,
        skills: userType === 'worker' ? selectedSkills : undefined,
      };
      const response = await apiRequest("POST", "/api/register", payload);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to Brojgar Worker. Redirecting to your dashboard...",
      });
      
      setTimeout(() => {
        if (userType === 'worker') {
          setLocation(`/worker-dashboard/${data.user.id}`);
        } else {
          setLocation(`/business-dashboard/${data.user.id}`);
        }
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const isWorker = userType === 'worker';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {isWorker ? (
                  <div className="bg-primary/10 p-4 rounded-full">
                    <HardHat className="h-8 w-8 text-primary" />
                  </div>
                ) : (
                  <div className="bg-secondary/10 p-4 rounded-full">
                    <Building className="h-8 w-8 text-secondary" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create {isWorker ? 'Worker' : 'Business'} Account
              </h2>
              <p className="text-gray-600 mt-2">
                {isWorker ? 'Start finding jobs in your area' : 'Start posting jobs and hiring workers'}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
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
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Area</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaOptions.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isWorker && (
                  <>
                    <div>
                      <FormLabel>Skills/Work Type</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {skillOptions.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={skill}
                              checked={selectedSkills.includes(skill)}
                              onCheckedChange={() => toggleSkill(skill)}
                            />
                            <label htmlFor={skill} className="text-sm text-gray-700">
                              {skill}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {!isWorker && (
                  <>
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a strong password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">Already have an account?</p>
              <Button variant="link" className="text-primary font-semibold">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
