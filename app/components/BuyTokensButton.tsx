import { Button, useDisclosure } from '@chakra-ui/react'
import TokenPurchaseModal from './TokenPurchaseModal'

export default function BuyTokensButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handlePurchaseSuccess = () => {
    onClose()
  }

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onOpen}
        size="sm"
      >
        Buy FractiTokens
      </Button>

      <TokenPurchaseModal
        isOpen={isOpen}
        onClose={onClose}
        onPurchase={handlePurchaseSuccess}
      />
    </>
  )
} 