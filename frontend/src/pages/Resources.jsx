import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";


const MotionBox = motion(Box);

const Resources = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
      textAlign="center"
    >
      {/* === BACKGROUND BRUSH GLOWS === */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-15%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-pink"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* === PAGE CONTENT === */}
      <VStack spacing={12} zIndex={1} maxW="800px">
        <Heading
          as="h1"
          fontSize={["3xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
        >
          Support & Resources
        </Heading>


        <SimpleGrid columns={[1]} spacing={8} w="full">
          {/* If you need urgent help (India) */}
          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 10]}
            textAlign="left"
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading
              as="h2"
              fontSize="2xl"
              mb={4}
              fontWeight="700"
              color="var(--hm-color-text-primary)"
            >
              If you need urgent help (India)
            </Heading>

            <VStack align="start" spacing={3} color="var(--hm-color-text-tertiary)" fontSize="md">
              <Text>
                <strong>Emergency number:</strong>{" "}
                <Link href="tel:112" color="var(--hm-color-accent-link)" _hover={{ textDecoration: "underline" }}>
                  112
                </Link>
              </Text>
              <Text>
                If you feel unsafe or are in immediate danger, please call <strong>112</strong> right now.
              </Text>
              <Text>
                For mental health support, look for trusted national or state helplines from official government websites, hospitals, and recognized NGOs in your area.
              </Text>
              <Text>
                If you are outside India, please contact your local emergency number or crisis helpline.
              </Text>
            </VStack>
          </Box>

          {/* Professional Help */}
          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 10]}
            textAlign="left"
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading
              as="h2"
              fontSize="2xl"
              mb={4}
              fontWeight="700"
              color="var(--hm-color-text-primary)"
            >
              Finding Professional Help
            </Heading>
            <VStack align="start" spacing={3} color="var(--hm-color-text-tertiary)" fontSize="md">
              <Text>
                If youd like to speak with a professional, consider:
              </Text>
              <Text>
                 Government or state health department websites for official directories
              </Text>
              <Text>
                 Local hospitals and medical colleges with psychiatry/psychology departments
              </Text>
              <Text>
                 Recognized NGOs that offer counseling services
              </Text>
              <Text>
                Many platforms also offer online therapy. Choose what feels safe and comfortable for you.
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default Resources;
