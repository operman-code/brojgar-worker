import PaymentModal from "./payment-modal";

interface JobBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  userId: string;
}

export default function JobBoostModal({ isOpen, onClose, jobId, userId }: JobBoostModalProps) {
  return (
    <PaymentModal
      isOpen={isOpen}
      onClose={onClose}
      jobId={jobId}
      userId={userId}
      amount={100}
      type="job_boost"
    />
  );
}
