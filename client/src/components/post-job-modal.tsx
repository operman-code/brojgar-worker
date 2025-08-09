import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  workType: z.string().min(1, "Work type is required"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  salary: z.string().min(1, "Salary is required"),
  workersNeeded: z.number().min(1, "At least 1 worker is required"),
  contactDetails: z.string().min(10, "Contact details are required"),
});

type JobData = z.infer<typeof jobSchema>;

const workTypes = ["Construction", "Delivery", "Cleaning", "Cooking", "Plumbing", "Electrical", "Painting", "Gardening", "Other"];
const durations = ["1 Day", "2-3 Days", "1 Week", "2 Weeks", "1 Month", "2-3 Months", "Permanent"];

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function PostJobModal({ isOpen, onClose, userId }: PostJobModalProps) {
  const [boost, setBoost] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<JobData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      workType: "",
      location: "",
      duration: "",
      salary: "",
      workersNeeded: 1,
      contactDetails: "",
    },
  });

  const postJobMutation = useMutation({
    mutationFn: async (data: JobData) => {
      const payload = {
        ...data,
        userId,
        boost,
      };
      const response = await apiRequest("POST", "/api/jobs", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully!",
        description: boost 
          ? "Your job has been posted and boosted for priority visibility."
          : "Your job has been posted and is now live.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/business/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business/profile'] });
      
      form.reset();
      setBoost(false);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Post Job",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobData) => {
    postJobMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Post a New Job</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Construction Helper" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workTypes.map((type) => (
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Describe the job requirements, skills needed, and other details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Work location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary/Payment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ₹800/day" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workersNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workers Needed</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Number of workers"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Contact person name, phone number, email..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="boost"
                  checked={boost}
                  onCheckedChange={setBoost}
                  className="mt-1"
                />
                <div>
                  <label htmlFor="boost" className="font-medium text-gray-900 cursor-pointer">
                    Boost this job for ₹100
                  </label>
                  <div className="text-sm text-gray-600">
                    Get priority placement and reach 30 targeted workers for better response
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={postJobMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={postJobMutation.isPending}
              >
                {postJobMutation.isPending ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
