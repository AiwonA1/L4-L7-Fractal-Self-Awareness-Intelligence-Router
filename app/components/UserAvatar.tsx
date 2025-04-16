'use client'

import { useState, useRef } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { FaCamera } from 'react-icons/fa'
import { createClient } from '@/lib/supabase'

interface UserAvatarProps {
  name?: string | null
  image?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export default function UserAvatar({ name, image, size = 'md' }: UserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const supabase = createClient

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Create form data
      const formData = new FormData()
      formData.append('image', file)

      // Upload image
      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      // Show success message
      toast({
        title: 'Success!',
        description: 'Profile picture updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Force a page refresh to show the new image
      window.location.reload()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box position="relative" display="inline-block">
      <Avatar
        name={name || undefined}
        src={image || undefined}
        size={size}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <IconButton
        aria-label="Upload profile picture"
        icon={isUploading ? <Spinner size="sm" /> : <FaCamera />}
        size="sm"
        position="absolute"
        bottom="0"
        right="0"
        colorScheme="teal"
        rounded="full"
        onClick={() => fileInputRef.current?.click()}
        isLoading={isUploading}
      />
    </Box>
  )
} 