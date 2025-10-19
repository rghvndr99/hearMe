import React from 'react';
import { HStack, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionButton = motion(Button);

/**
 * Quick reply buttons component
 * @param {Object} props
 * @param {Array<string>} props.replies - Array of quick reply texts
 * @param {Function} props.onReplyClick - Callback when a reply is clicked
 * @param {boolean} props.disabled - Whether buttons are disabled
 */
const QuickReplies = ({ replies, onReplyClick, disabled = false }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <AnimatePresence>
      <HStack
        spacing={2}
        flexWrap="wrap"
        mb={2}
        className="hm-quick-replies"
      >
        {replies.map((reply, index) => (
          <MotionButton
            key={index}
            size="sm"
            variant="outline"
            onClick={() => onReplyClick(reply)}
            isDisabled={disabled}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.1 }}
            className="hm-quick-reply-btn"
          >
            {reply}
          </MotionButton>
        ))}
      </HStack>
    </AnimatePresence>
  );
};

export default QuickReplies;

