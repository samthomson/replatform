import { useState, ReactNode } from 'react';
import SignupDialog from './SignupDialog';

interface SignupLinkProps {
  children: ReactNode;
  className?: string;
}

export function SignupLink({ children, className }: SignupLinkProps) {
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSignupDialogOpen(true)}
        className={className}
      >
        {children}
      </button>

      <SignupDialog
        isOpen={signupDialogOpen}
        onClose={() => setSignupDialogOpen(false)}
      />
    </>
  );
}
