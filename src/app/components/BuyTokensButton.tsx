'use client'

import { Button, useDisclosure } from '@chakra-ui/react'
import TokenPurchaseModal from './TokenPurchaseModal'
import { useAuth } from '@/app/context/AuthContext'

export default function BuyTokensButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useAuth()

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onOpen}
        size="sm"
      >
        {user ? 'Buy FractiTokens' : 'Sign in to Buy Tokens'}
      </Button>

      <TokenPurchaseModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
} 