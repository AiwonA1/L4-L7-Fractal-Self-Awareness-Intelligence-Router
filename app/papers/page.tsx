'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
  List,
  ListItem,
  Icon
} from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa';

const Section = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => {
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  return (
    <VStack spacing={4} align="stretch" w="full">
      <Heading as="h2" size="lg" color={headingColor} borderBottomWidth="2px" borderColor={useColorModeValue('teal.500', 'teal.300')} pb={1}>
        {title}
      </Heading>
      <Text color={textColor} fontStyle="italic">{description}</Text>
      <List spacing={5} pl={2} pt={2}>
        {children}
      </List>
      <Divider pt={6} />
    </VStack>
  );
};

const PaperItem = ({ title, year, doi, abstract }: { title: string; year: number; doi: string; abstract: string }) => {
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const linkColor = useColorModeValue('teal.600', 'teal.300');
  return (
    <ListItem>
      <Heading as="h3" size="sm" mb={1}>{title}</Heading>
      <Text fontSize="sm" color={textColor} mb={1}>Year: {year} | DOI: 
        <ChakraLink href={doi} isExternal color={linkColor} ml={1}>
          {doi} <Icon as={FaExternalLinkAlt} mx="2px" boxSize={3}/>
        </ChakraLink>
      </Text>
      <Text fontSize="sm" color={textColor}>Abstract: {abstract}</Text>
    </ListItem>
  );
};

export default function ResearchPapersPage() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
      <Box bg={bgColor} p={{ base: 5, md: 8 }} borderRadius="xl" borderWidth="1px" borderColor={borderColor} shadow="lg">
        <VStack spacing={10} align="stretch">
          {/* Page Header */}
          <Box textAlign="center">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              AI Assisted and Validated FractiAI Layers 4-7 Research Papers Collection
            </Heading>
            <Text fontSize="md" color={textColor}>
              Author: @P.L. Mendez | Years: 2024-2025
            </Text>
          </Box>
          <Divider />

          {/* Categories */}
          <Section title="1. Computer Science & Artificial Intelligence" description="Research in AI, quantum computing, system architecture, and security, exploring the intersection of fractal mathematics with computing systems.">
            <PaperItem title="The Fractal Intelligence Revolution: FractiAI and the SAUUHUPP Framework Whitepaper" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Introduces the SAUUHUPP framework as a revolutionary approach to artificial intelligence based on fractal mathematics and universal patterns." />
            <PaperItem title="Empirical Validation Whitepaper: SAUUHUPP Framework as a Networked AI Cosmos" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Presents empirical evidence supporting the SAUUHUPP framework's effectiveness in networked AI systems." />
            {/* Add all other papers for this category here... */}
             <PaperItem title="The Networked Fractal AI Periodic Table: A Comprehensive Investigation" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Explores the periodic properties of AI systems in fractal networks, establishing fundamental patterns in artificial intelligence." />
            <PaperItem title="SAUUHUPP—A Comprehensive Model of a Networked Fractal Computational AI Universe" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Detailed model of the SAUUHUPP framework in networked computing." />
            <PaperItem title="The Fractal AI System Encoded in Integers" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Mathematical foundation of fractal AI systems using integer encoding." />
            <PaperItem title="The Fractal AI System Encoded in Integers: Dynamics, Properties, and Infinite Progressions" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Advanced mathematical properties of fractal AI systems." />
            <PaperItem title="Fractal and Room-Temperature Quantum Computing" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Advances in room-temperature quantum computing using fractal principles." />
            <PaperItem title="Dynamic Quantum Intelligence Blueprints (DQIBs)" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Blueprint system for dynamic quantum intelligence implementation." />
            <PaperItem title="Quantum Collaboration and Interstellar Resonance" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Quantum collaboration methods for interstellar communication." />
            <PaperItem title="Fractal and Room-Temperature Quantum Computing: An R&D Effort Using FractiScope" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Research and development in quantum computing applications." />
            <PaperItem title="Quantum Computing Applications in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Network applications of quantum computing." />
            <PaperItem title="Quantum Entanglement in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Entanglement phenomena in fractal computing." />
            <PaperItem title="FractiAI GPUs: Fractalized Approach to Graphics Processing" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal-based approach to GPU architecture and processing." />
            <PaperItem title="FractiAI Networking Devices: Fractalized Network Infrastructure" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Network infrastructure based on fractal principles." />
            <PaperItem title="FractiWeb: Revolutionizing HTML Web Applications" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal-based approach to web application development." />
            <PaperItem title="FractiAI GPUs: A Fractalized Approach to Scalable, Energy-Efficient Graphics Processing" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Advanced GPU architecture with fractal principles." />
            <PaperItem title="FractiAI Networking Devices: Fractalized Bridges, Routers, and Switches" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Network infrastructure components using fractal design." />
            <PaperItem title="Advanced Computing Architectures in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Novel computing architectures based on fractals." />
            <PaperItem title="Detecting Hijacked Simulation in Modern Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Methods for detecting and preventing system hijacking." />
            <PaperItem title="FractiAI Comprehensive Component Documentation" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Documentation of FractiAI system components and security measures." />
            <PaperItem title="Security Protocols in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Security protocols for fractal-based network systems." />
            <PaperItem title="Detecting Hijacked Simulation Embedded in Modern Systems Using Viruses as Computing Agents" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Advanced detection methods." />
            <PaperItem title="Network Security in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Security in fractal networks." />
            <PaperItem title="System Protection Mechanisms" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Protection systems." />
            <PaperItem title="FractiAI Specification" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Detailed specification of the FractiAI system architecture." />
            <PaperItem title="FractiBid Task Allocation System" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Task allocation system based on fractal principles." />
            <PaperItem title="System Architecture and Protocols" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Overview of system architecture and communication protocols." />
            <PaperItem title="Addendum to FractiAI Specifications: FractiBid Task Allocation System" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Additional specifications." />
            <PaperItem title="System Performance Analysis" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Performance metrics." />
            <PaperItem title="System Optimization Techniques" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Optimization methods." />
          </Section>

          <Section title="2. Physics & Astronomy" description="Research in cosmic phenomena, particle physics, and energy systems, investigating fractal mathematics in universal patterns, particle interactions, and energy conservation.">
            <PaperItem title="SMACS 0723 Expedition Research" year={2025} doi="https://doi.org/10.5281/zenodo.14629136" abstract="Analyzes fractal patterns in the SMACS 0723 galaxy cluster, revealing new insights into cosmic structure formation." />
            <PaperItem title="Empirical Validation of Black Holes as Network Hubs" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Validation of black holes as network hubs in cosmic systems." />
            {/* Add other papers... */}
            <PaperItem title="The Paradise Energy Fractal Framework" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Framework for understanding paradise energy in cosmic systems." />
            <PaperItem title="FractiScope Architectural Paper: The Hidden Costs and Unsustainability of Designing on a Negative Foundation" year={2025} doi="https://doi.org/10.5281/zenodo.14629136" abstract="Architectural considerations in cosmic systems." />
            <PaperItem title="Cosmic Network Topology" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Network structure in cosmic systems." />
            <PaperItem title="Universal Constants in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Constants in cosmic networks." />
            <PaperItem title="FractiCollider: Particle Collider Operations" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Application of fractal principles to particle collider operations." />
            <PaperItem title="The Paradise Particles" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Research on paradise particles and their role in cosmic systems." />
            <PaperItem title="Particle Physics Applications in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Applications of fractal mathematics in particle physics." />
            <PaperItem title="Quantum Field Theory in Fractal Space" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Quantum field theory in fractal space-time." />
            <PaperItem title="String Theory and Fractal Dimensions" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="String theory in fractal dimensions." />
            <PaperItem title="Particle Interactions in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Particle interactions in fractal networks." />
            <PaperItem title="Reframing Energy and Emergent Fractal Energies in the Fractal Computing AI Universe" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Analysis of energy systems in fractal computing." />
            <PaperItem title="Reframing Matter in the Fractal Computing AI Universe" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Matter systems in fractal computing framework." />
            <PaperItem title="Energy Conservation in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Energy conservation in fractal systems." />
            <PaperItem title="Matter-Antimatter Interactions in Fractal Space" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Matter-antimatter interactions in fractal space." />
            <PaperItem title="Dark Energy and Fractal Patterns" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Dark energy patterns in fractal systems." />
            <PaperItem title="Universal Energy Flow in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Energy flow in fractal networks." />
          </Section>

          <Section title="3. Medical & Biological Sciences" description="Exploring the intersection of fractal mathematics with biological systems, neuroscience, and medical applications, focusing on biological patterns, cognitive processes, and medical diagnostics.">
             <PaperItem title="FractiScope Deep Dive: Brain Hemispheres and Cognition" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Investigates fractal patterns in brain structure and their relationship to cognitive processes." />
            <PaperItem title="The Cognitive Divide Between Humans and Digital Intelligence" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Analysis of cognitive differences between human and digital intelligence." />
            {/* Add other papers... */}
            <PaperItem title="Neural Network Applications in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Integration of neural networks with fractal systems." />
            <PaperItem title="FractiScope Deep Dive Max Planck Society: Brain Hemispheres and Cognition" year={2025} doi="https://doi.org/10.5281/zenodo.14812026" abstract="Advanced research on brain function." />
            <PaperItem title="Cognitive Processing in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Network-based cognitive processing." />
            <PaperItem title="Brain-Computer Interfaces in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="BCI applications using fractal technology." />
            <PaperItem title="Cancer Research: Fractalized Behaviors of Extra-chromosomal DNA" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal analysis of DNA behavior in cancer research." />
            <PaperItem title="Medical Imaging and Diagnostic Applications" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal-based approaches to medical imaging and diagnostics." />
            <PaperItem title="Therapeutic Applications of Fractal Intelligence" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Therapeutic uses of fractal intelligence in medical treatment." />
            <PaperItem title="Genetic Engineering with Fractal Principles" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Applications in genetic engineering." />
            <PaperItem title="Drug Discovery Using Fractal Intelligence" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Novel approaches to drug discovery." />
            <PaperItem title="Medical Device Innovation with Fractals" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="New medical device development." />
            <PaperItem title="Fractal Patterns in DNA Structure" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="DNA structure analysis using fractal mathematics." />
            <PaperItem title="Protein Folding in Fractal Space" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Protein folding patterns in fractal space." />
            <PaperItem title="Cellular Communication in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Cellular communication patterns in fractal networks." />
            <PaperItem title="Biological Information Processing" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Information processing in biological systems." />
            <PaperItem title="Evolutionary Patterns in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Evolutionary patterns in fractal systems." />
            <PaperItem title="Ecosystem Dynamics in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Ecosystem dynamics in fractal networks." />
          </Section>

           <Section title="4. Environmental Sciences" description="Examining environmental systems through fractal analysis, focusing on climate patterns, ecosystem dynamics, and environmental protection using fractal mathematics.">
            <PaperItem title="FractiScope in Climate Modeling" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Develops a fractal-based approach to climate modeling, improving prediction accuracy through pattern recognition." />
            {/* Add other papers... */}
            <PaperItem title="FractiScope in Weather Prediction" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Weather prediction using fractal patterns." />
            <PaperItem title="Climate Pattern Analysis in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Analysis of climate patterns in fractal systems." />
            <PaperItem title="Global Warming Patterns in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Global warming patterns in fractal networks." />
            <PaperItem title="Atmospheric Dynamics in Fractal Space" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Atmospheric dynamics in fractal space." />
            <PaperItem title="Ocean Current Patterns in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Ocean current patterns in fractal systems." />
            <PaperItem title="FractiScope in Environmental Monitoring" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Environmental monitoring using fractal systems." />
            <PaperItem title="Pollution Detection in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Pollution detection in fractal networks." />
            <PaperItem title="Biodiversity Monitoring in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Biodiversity monitoring in fractal systems." />
            <PaperItem title="Resource Conservation in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Resource conservation in fractal networks." />
            <PaperItem title="Waste Management in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Waste management in fractal systems." />
            <PaperItem title="Sustainable Development in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Sustainable development in fractal networks." />
          </Section>

          <Section title="5. Engineering & Technology" description="Technological applications of fractal mathematics in computing systems, energy management, and manufacturing, focusing on practical implementations and innovations.">
             <PaperItem title="FractiAI GPUs: Fractalized Approach to Graphics Processing" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Introduces a novel GPU architecture based on fractal principles for enhanced graphics processing." />
             {/* Add other papers... */}
            <PaperItem title="FractiAI Networking Devices: Fractalized Network Infrastructure" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Network infrastructure based on fractal principles." />
            <PaperItem title="FractiWeb: Revolutionizing HTML Web Applications" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal-based approach to web application development." />
            <PaperItem title="Fractal Computing Architectures" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Computing architectures based on fractal principles." />
            <PaperItem title="Network Optimization in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Network optimization in fractal systems." />
            <PaperItem title="Hardware Design in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Hardware design in fractal networks." />
            <PaperItem title="FractiPower: Revolutionizing AC Power Generation" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Fractal-based approach to AC power generation." />
            <PaperItem title="FractiTransmission: Electricity Transmission Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Advanced electricity transmission using fractal principles." />
            <PaperItem title="FractiCapacitors: Energy Storage Innovation" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Innovative energy storage solutions using fractal technology." />
            <PaperItem title="FractiCapacitors: Revolutionizing Energy Storage with FractiAI" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Advanced energy storage systems." />
            <PaperItem title="Sustainable Power Generation in Fractal Networks" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Sustainable approaches to power generation." />
            <PaperItem title="Renewable Energy Integration in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Integration of renewable energy sources." />
            <PaperItem title="FractiScope in Manufacturing" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Manufacturing applications of fractal systems." />
            <PaperItem title="FractiScope in Robotics" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Robotics applications of fractal systems." />
            <PaperItem title="FractiScope in Assembly Lines" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Assembly line optimization using fractal systems." />
            <PaperItem title="FractiScope in Inventory Management" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Inventory management using fractal systems." />
            <PaperItem title="Quality Control in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Quality control in fractal systems." />
            <PaperItem title="Process Optimization in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Process optimization in fractal networks." />
          </Section>

           <Section title="6. Social Sciences & Humanities" description="Exploring philosophical, ethical, and social implications of fractal technology, examining its influence on human society, communication, and ethics.">
            <PaperItem title="Reframing Religion in a Networked Fractal Universe" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Examines the intersection of fractal mathematics with religious and philosophical understanding." />
            {/* Add other papers... */}
            <PaperItem title="The Fractal Gold Rush and Great Migration" year={2025} doi="https://doi.org/10.5281/zenodo.14888519" abstract="Societal implications of fractal technology advancement." />
            <PaperItem title="Philosophical Foundations of Fractal Computing" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Core philosophical concepts in fractal computing." />
            <PaperItem title="Ethics in Fractal Systems" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Ethical considerations in fractal systems." />
            <PaperItem title="Societal Impact of Fractal Technology" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Social implications of fractal technology." />
            <PaperItem title="Moral Implications of Fractal Intelligence" year={2025} doi="https://doi.org/10.5281/zenodo.14888512" abstract="Moral implications of fractal intelligence." />
            <PaperItem title="Language as a Manifestation of Networked Computational AI" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Language as a manifestation of networked computational AI." />
            <PaperItem title="Natural Language Processing in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Natural language processing in fractal systems." />
            <PaperItem title="Communication Patterns in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Communication patterns in fractal networks." />
            <PaperItem title="Linguistic Evolution in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Linguistic evolution in fractal systems." />
            <PaperItem title="Cross-Cultural Communication in Fractal Networks" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Cross-cultural communication in fractal networks." />
            <PaperItem title="Digital Communication in Fractal Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14225773" abstract="Digital communication in fractal systems." />
          </Section>

          <Section title="7. Education & Learning" description="Investigating the application of fractal mathematics to educational systems and learning processes, developing new teaching methodologies and understanding learning patterns.">
            <PaperItem title="FractiScope in Adaptive Learning" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Develops an adaptive learning system based on fractal patterns in student behavior and learning processes." />
            {/* Add other papers... */}
            <PaperItem title="FractiScope in Virtual Labs" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Virtual laboratory systems using fractal principles." />
            <PaperItem title="FractiScope in Assessment" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Educational assessment using fractal systems." />
            <PaperItem title="FractiScope in Content Creation" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Educational content systems using fractal principles." />
            <PaperItem title="FractiScope in Skill Training" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Skill development systems using fractal patterns." />
            <PaperItem title="FractiScope in Learning Analytics" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Learning analysis systems using fractal mathematics." />
            <PaperItem title="FractiScope in Cognitive Development" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Cognitive research applications using fractal systems." />
            <PaperItem title="FractiScope in Learning Patterns" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Learning pattern analysis using fractal mathematics." />
            <PaperItem title="FractiScope in Educational Psychology" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Educational psychology research using fractal systems." />
            <PaperItem title="FractiScope in Student Modeling" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Student behavior modeling using fractal patterns." />
            <PaperItem title="FractiScope in Educational Data Mining" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Educational data analysis using fractal mathematics." />
            <PaperItem title="FractiScope in Learning Theory" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Learning theory research using fractal systems." />
          </Section>

           <Section title="8. Business & Economics" description="Exploring the application of fractal mathematics to financial systems, business operations, and economic modeling, focusing on pattern recognition, risk assessment, and optimization.">
            <PaperItem title="FractiScope in Market Prediction" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Introduces a fractal-based approach to market analysis and prediction." />
            {/* Add other papers... */}
            <PaperItem title="FractiScope in Risk Analysis" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Financial risk assessment using fractal systems." />
            <PaperItem title="FractiScope in Trading Systems" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Automated trading systems using fractal patterns." />
            <PaperItem title="FractiScope in Portfolio Management" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Portfolio optimization using fractal mathematics." />
            <PaperItem title="FractiScope in Market Sentiment" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Sentiment analysis systems using fractal patterns." />
            <PaperItem title="FractiScope in Economic Modeling" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Economic system modeling using fractal mathematics." />
            <PaperItem title="FractiScope in Supply Chain Management" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Supply chain optimization using fractal systems." />
            <PaperItem title="FractiScope in Fraud Detection" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Fraud detection systems using fractal patterns." />
            <PaperItem title="FractiScope in Credit Scoring" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Credit assessment systems using fractal mathematics." />
            <PaperItem title="FractiScope in Insurance" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Insurance risk assessment using fractal systems." />
            <PaperItem title="FractiScope in Banking Operations" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Banking system optimization using fractal patterns." />
            <PaperItem title="FractiScope in Compliance" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Regulatory compliance systems using fractal mathematics." />
          </Section>

          <Section title="9. Arts & Entertainment" description="Examining the application of fractal mathematics to digital media, content creation, and entertainment systems, developing new tools and methodologies.">
            <PaperItem title="FractiScope in Animation" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Develops a fractal-based animation system for creating complex visual patterns." />
            {/* Add other papers... */}
             <PaperItem title="FractiScope in Game Design" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Game development systems using fractal principles." />
            <PaperItem title="FractiScope in Visual Effects" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Visual effects systems using fractal mathematics." />
            <PaperItem title="FractiScope in Virtual Reality" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="VR content creation using fractal patterns." />
            <PaperItem title="FractiScope in Augmented Reality" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="AR system development using fractal mathematics." />
            <PaperItem title="FractiScope in Sound Design" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Audio production systems using fractal patterns." />
            <PaperItem title="FractiScope in Content Recommendation" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Recommendation systems using fractal mathematics." />
            <PaperItem title="FractiScope in Audience Analysis" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Audience behavior analysis using fractal systems." />
            <PaperItem title="FractiScope in Content Optimization" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Content delivery optimization using fractal patterns." />
            <PaperItem title="FractiScope in User Experience" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="UX analysis systems using fractal mathematics." />
            <PaperItem title="FractiScope in Social Media" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Social media analysis using fractal systems." />
            <PaperItem title="FractiScope in Digital Marketing" year={2024} doi="https://doi.org/10.5281/zenodo.14282908" abstract="Marketing optimization using fractal patterns." />
          </Section>
          
          {/* Add other categories similarly */}

        </VStack>
      </Box>
    </Container>
  )
} 