import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const Resources = () => {
  const { t } = useTranslation('common');
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
      {/* === PAGE CONTENT === */}
      <VStack spacing={12} zIndex={1} maxW="800px">
        <Heading
          as="h1"
          fontSize={["3xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
        >
          {t('resources.title')}
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
              {t('resources.urgent.title')}
            </Heading>

            <VStack align="start" spacing={3} color="var(--hm-color-text-tertiary)" fontSize="md">
              <Text>
                <strong>{t('resources.urgent.emergencyLabel')}</strong>{" "}
                <Link href="tel:112" color="var(--hm-color-accent-link)" _hover={{ textDecoration: "underline" }}>
                  112
                </Link>
              </Text>
              <Text>
                {t('resources.urgent.callNow')}
              </Text>
              <Text>
                {t('resources.urgent.helplines')}
              </Text>
              <Text>
                {t('resources.urgent.outside')}
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
              {t('resources.professional.title')}
            </Heading>
            <VStack align="start" spacing={3} color="var(--hm-color-text-tertiary)" fontSize="md">
              <Text>
                {t('resources.professional.intro')}
              </Text>
              <Text>
                {t('resources.professional.govtDirs')}
              </Text>
              <Text>
                {t('resources.professional.hospitals')}
              </Text>
              <Text>
                {t('resources.professional.ngos')}
              </Text>
              <Text>
                {t('resources.professional.closing')}
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default Resources;
