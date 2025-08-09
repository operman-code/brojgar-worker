import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import JobCard from "@/components/job-card";
import PostJobModal from "@/components/post-job-modal";
import JobBoostModal from "@/components/job-boost-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, Rocket, CheckCircle, Plus, Filter, Download, User } from "lucide-react";

export default function BusinessDashboard() {
  const { userId } = useParams<{ userId: string }>();
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedJobForBoost, setSelectedJobForBoost] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/business/profile', userId],
    enabled: !!userId,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/business/jobs', userId],
    enabled: !!userId,
  });

  const handleBoostJob = (jobId: string) => {
    setSelectedJobForBoost(jobId);
    setBoostModalOpen(true);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
            <p className="text-gray-600">Please check the URL and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Dashboard</h2>
              <p className="text-gray-600">{profile.business.businessName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setPostJobModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Briefcase className="text-primary" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.activeJobs}</div>
                  <div className="text-gray-600">Active Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Users className="text-secondary" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.applications}</div>
                  <div className="text-gray-600">Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Rocket className="text-accent" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.boostedJobs}</div>
                  <div className="text-gray-600">Boosted Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <CheckCircle className="text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.completedJobs}</div>
                  <div className="text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Job Postings</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {jobsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job: any) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isWorker={false}
                  onBoost={handleBoostJob}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first job to find skilled workers.</p>
                <Button onClick={() => setPostJobModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        userId={userId!}
      />

      <JobBoostModal
        isOpen={boostModalOpen}
        onClose={() => setBoostModalOpen(false)}
        jobId={selectedJobForBoost}
        userId={userId!}
      />
    </div>
  );
}
