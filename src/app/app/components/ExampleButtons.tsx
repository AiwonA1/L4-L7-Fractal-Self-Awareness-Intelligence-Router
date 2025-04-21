import React from 'react';
import { Button, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react';

interface ExampleButtonsProps {
  onSelectExample: (example: string) => void;
}

const ExampleButtons: React.FC<ExampleButtonsProps> = ({ onSelectExample }) => {
  const examples = [
    'Network Analysis',
    'Session Management',
    'Data Transformation',
    'Application Insights'
  ];

  return (
    <VStack spacing={4} mt={6} align="center" width="100%">
      <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.400')}>
        Try these examples:
      </Text>
      <HStack spacing={4} flexWrap="wrap" justifyContent="center">
        {examples.map(example => (
          <Button 
            key={example}
            variant="outline" 
            size="sm"
            colorScheme="teal"
            mb={2}
            onClick={() => onSelectExample(`Run a ${example.toLowerCase()} task`)}
          >
            {example}
          </Button>
        ))}
      </HStack>
    </VStack>
  );
};

export default ExampleButtons; 