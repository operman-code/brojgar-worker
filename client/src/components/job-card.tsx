import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Briefcase, Clock, IndianRupee, Users, Edit, Rocket, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    workType: string;
    location: string;
    duration: string;
    salary: string;
    workersNeeded: number;
    contactDetails: string;
    isBoosted: boolean;
    boostExpiresAt: string | null;
    isActive: boolean;
    createdAt: string;
    isUnlocked?: boolean;
    applicationsCount?: number;
  };
  isWorker: boolean;
  onUnlock?: (jobId: string) => void;
  onBoost?: (jobId: string) => void;
  onEdit?: (jobId: string) => void;
  onViewApplications?: (jobId: string) => void;
}

export default function JobCard({ 
  job, 
  isWorker, 
  onUnlock, 
  onBoost, 
  onEdit, 
  onViewApplications 
}: JobCardProps) {
  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getBoostTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Expired';
  };

  return (
    <Card className="job-card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
              {job.isBoosted && (
                <Badge className="ml-2 boost-badge text-white">
                  BOOSTED
                </Badge>
              )}
              {isWorker && job.isActive && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  ACTIVE
                </Badge>
              )}
              {!isWorker && job.isActive && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  ACTIVE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.location}</span>
              {!isWorker && (
                <>
                  <Calendar className="h-4 w-4 ml-4 mr-2" />
                  <span>Posted {formatTimeAgo(job.createdAt)}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center text-gray-600 mb-3">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{job.workType}</span>
              <Clock className="h-4 w-4 ml-4 mr-2" />
              <span>{job.duration}</span>
              <IndianRupee className="h-4 w-4 ml-4 mr-2" />
              <span>{job.salary}</span>
            </div>
            
            <p className="text-gray-700">
              {isWorker && !job.isUnlocked 
                ? `${job.description.substring(0, 100)}...`
                : job.description}
            </p>
          </div>
          
          <div className="text-right ml-4">
            {isWorker ? (
              <div className="text-2xl font-bold text-gray-900 mb-1">{job.salary}</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary mb-1">{job.applicationsCount || 0}</div>
                <div className="text-sm text-gray-500">Applications</div>
              </>
            )}
            <div className="text-sm text-gray-500">
              {isWorker ? `Posted ${formatTimeAgo(job.createdAt)}` : ''}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {isWorker ? (
            <>
              {job.isUnlocked ? (
                <div className="flex items-center text-sm text-green-600">
                  <Lock className="h-4 w-4 mr-1" />
                  Full details unlocked
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-1" />
                  Pay ₹20 to view full details
                </div>
              )}
              
              {!job.isUnlocked && onUnlock && (
                <Button 
                  onClick={() => onUnlock(job.id)}
                  className="bg-accent text-white hover:bg-yellow-600"
                >
                  Unlock Details - ₹20
                </Button>
              )}
              
              {job.isUnlocked && (
                <div className="text-sm text-gray-700">
                  <strong>Contact:</strong> {job.contactDetails}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => onViewApplications?.(job.id)}
                  variant="default"
                  size="sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Applications ({job.applicationsCount || 0})
                </Button>
                <Button 
                  onClick={() => onEdit?.(job.id)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {!job.isBoosted && onBoost && (
                  <Button 
                    onClick={() => onBoost(job.id)}
                    className="bg-accent text-white hover:bg-yellow-600"
                    size="sm"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Boost - ₹100
                  </Button>
                )}
              </div>
              
              {job.isBoosted && job.boostExpiresAt && (
                <div className="flex items-center text-sm text-accent">
                  <Rocket className="h-4 w-4 mr-1" />
                  Boost expires in {getBoostTimeRemaining(job.boostExpiresAt)}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
