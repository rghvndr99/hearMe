import React from 'react';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import { FaComments } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ChatBubble = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the chat bubble on the chat page itself
  if (location.pathname === '/chat') {
    return null;
  }

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <MotionBox
      position="fixed"
      bottom="30px"
      right="30px"
      zIndex="9999"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Tooltip
        label="Chat with us"
        placement="left"
        hasArrow
        bg="var(--hm-color-brand)"
        color="white"
        fontSize="sm"
        borderRadius="md"
      >
        <IconButton
          icon={<FaComments size={28} />}
          onClick={handleClick}
          size="lg"
          isRound
          bgGradient="var(--hm-gradient-cta)"
          color="white"
          _hover={{
            bgGradient: "var(--hm-gradient-cta-hover)",
            transform: "scale(1.1)",
          }}
          _active={{
            transform: "scale(0.95)",
          }}
          boxShadow="0 4px 20px rgba(247, 107, 28, 0.4)"
          transition="all 0.3s ease"
          aria-label="Open chat"
          w="60px"
          h="60px"
        />
      </Tooltip>

      {/* Pulse animation ring */}
      <MotionBox
        position="absolute"
        top="50%"
        left="50%"
        w="60px"
        h="60px"
        borderRadius="full"
        border="2px solid"
        borderColor="var(--hm-color-brand)"
        opacity={0.6}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transform: "translate(-50%, -50%)",
        }}
        pointerEvents="none"
      />
    </MotionBox>
  );
};

export default ChatBubble;

