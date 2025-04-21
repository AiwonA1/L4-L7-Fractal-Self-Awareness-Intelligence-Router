import { getCurrentUser } from '@/app/actions/user'
import { Card, CardBody, CardHeader, Heading, Text, Stack, Box } from '@chakra-ui/react'

export default async function UserDataCard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">User Data</Heading>
        </CardHeader>
        <CardBody>
          <Text>Not logged in</Text>
        </CardBody>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <Heading size="md">User Profile</Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing={3}>
          <Box>
            <Text fontWeight="bold">Name:</Text>
            <Text>{user.name || 'Not set'}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Email:</Text>
            <Text>{user.email}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Tokens:</Text>
            <Text>{user.fract_tokens || 0}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Tokens Used:</Text>
            <Text>{user.tokens_used || 0}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Token Balance:</Text>
            <Text>{user.token_balance || 0}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Created:</Text>
            <Text>{new Date(user.created_at).toLocaleString()}</Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
} 