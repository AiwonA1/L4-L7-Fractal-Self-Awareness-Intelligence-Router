import React from 'react';
import {
  VStack,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { formatPrice } from '@/app/lib/stripe';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

interface PurchaseHistoryProps {
  transactions: Transaction[];
}

export default function PurchaseHistory({ transactions }: PurchaseHistoryProps) {
  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Purchase History
        </Text>
        {transactions.length === 0 ? (
          <Text color="gray.500">No purchase history available.</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={transaction.type === 'PURCHASE' ? 'green' : 'blue'}
                      >
                        {transaction.type}
                      </Badge>
                    </Td>
                    <Td>{formatPrice(transaction.amount)}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          transaction.status === 'COMPLETED'
                            ? 'green'
                            : transaction.status === 'PENDING'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </Td>
                    <Td>{transaction.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </VStack>
  );
} 