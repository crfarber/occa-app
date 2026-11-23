import { createContext, useContext, type ReactNode } from 'react';
import type { SubmissionService } from '../service/submission-service';

const SubmissionContext = createContext<SubmissionService | null>(null);

export function SubmissionProvider({
  value,
  children,
}: {
  value: SubmissionService;
  children: ReactNode;
}) {
  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}

export function useSubmission(): SubmissionService {
  const value = useContext(SubmissionContext);
  if (value === null) {
    throw new Error('SubmissionProvider is missing');
  }
  return value;
}
