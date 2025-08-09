import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  userId: string;
  amount: number;
  type: 'job_unlock' | 'job_boost' | 'wallet_topup';
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  jobId, 
  userId, 
  amount, 
  type 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const endpoint = type === 'job_unlock' 
        ? '/api/payments/unlock-job'
        : type === 'job_boost'
        ? '/api/payments/boost-job'
        : '/api/payments/topup-wallet';
      
      const payload = { userId, jobId, amount };
      const response = await apiRequest("POST", endpoint, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: type === 'job_unlock' 
          ? "Job details unlocked successfully."
          : type === 'job_boost'
          ? "Job boosted successfully!"
          : "Wallet topped up successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/worker/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/worker/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business/profile'] });
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    paymentMutation.mutate();
  };

  const getTitle = () => {
    switch (type) {
      case 'job_unlock':
        return 'Unlock Job Details';
      case 'job_boost':
        return 'Boost Job';
      case 'wallet_topup':
        return 'Top Up Wallet';
      default:
        return 'Payment';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'job_unlock':
        return 'View full job description, contact details, and application instructions';
      case 'job_boost':
        return 'Your job will appear at the top of search results for 30 days and be shown to targeted workers';
      case 'wallet_topup':
        return 'Add money to your wallet balance';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{getTitle()}</span>
              <span className="text-xl font-bold">₹{amount}</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {getDescription()}
            </div>
          </CardContent>
        </Card>

        {type === 'job_boost' && (
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Boost Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Top placement in job listings</li>
                <li>✓ Reach 30 targeted workers directly</li>
                <li>✓ Priority visibility for 30 days</li>
                <li>✓ 3x more applications on average</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet">Use Wallet Balance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI Payment</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={paymentMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            className="flex-1"
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? "Processing..." : `Pay ₹${amount}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
