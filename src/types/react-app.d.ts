import { ReactNode } from 'react';

declare module '@chakra-ui/react' {
  interface StackProps {
    children?: ReactNode;
  }

  interface FlexProps {
    children?: ReactNode;
  }

  interface BoxProps {
    children?: ReactNode;
  }

  interface ModalProps {
    children?: ReactNode;
  }

  interface ModalContentProps {
    children?: ReactNode;
  }

  interface ModalBodyProps {
    children?: ReactNode;
  }

  interface ModalFooterProps {
    children?: ReactNode;
  }

  interface FormControlProps {
    children?: ReactNode;
  }

  interface AlertDialogContentProps {
    children?: ReactNode;
  }

  interface AlertDialogBodyProps {
    children?: ReactNode;
  }

  interface AlertDialogFooterProps {
    children?: ReactNode;
  }
} 