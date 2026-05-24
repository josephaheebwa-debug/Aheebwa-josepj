import { ScenarioItem } from "./types";

export const PRESEEDED_ITEMS: ScenarioItem[] = [
  {
    id: "seed-ggaba",
    topic: "Ecology (Population Ecology, Invasive Species & Energy Flow)",
    class_level: "S6",
    difficulty: "Intermediate",
    scenario: "Babirye is a young researcher visiting Ggaba landing site on Murchison Bay, Lake Victoria, in Kampala district. Over the last five years, she has observed a massive green carpet of the water hyacinth (Eichhornia crassipes) covering the water surface near the shore. Local fisherman, Aloni, complains that catching Nile Tilapia (Oreochromis niloticus) has become extremely difficult as the hyacinth entangles their nets and boat engines. Babirye notices that underneath the thick weeds, there is very little ambient light, and the water has a foul smell. Water testing reveals extremely low dissolved oxygen levels, especially during late afternoon. Many dead young Tilapia are floating near the edge. Meanwhile, Aloni points out a massive growth of blue-green algae (microscopic cyanobacteria) blooms in open areas nearby where raw sewage and run-off from agricultural farms in Munyonyo enter the lake. The high nutrient levels (mainly nitrates and phosphates) trigger these algal blooms, causing eutrophication that threatens the local aquatic food chain.",
    tasks: [
      {
        task_number: 1,
        task_text: "Based on the scenario and biological concepts, describe the process taking place in Murchison Bay triggered by run-off from agricultural farms and sewage, and explain how it leads to the mass death of Nile Tilapia.",
        marks: 10,
        competency: "Critical thinking and problem-solving",
        bloom_level: "Analysis",
        model_answer: "The process is eutrophication. Nitrogen and phosphorus from agricultural run-off and raw sewage act as nutrients, stimulating rapid growth of blue-green algal populations (algal blooms). When these algae die due to overcrowding and nutrient exhaustion, saprophytic decomposers (bacteria) multiply rapidly and feed on the decaying matter. These decomposers consume immense amounts of dissolved oxygen for aerobic respiration. Since the water hyacinth also blocks sunlight from reaching underwater phytoplankton, photosynthesis is severely limited. This combination generates a critical oxygen deficit. Nile Tilapia are aerobic organisms; without sufficient dissolved oxygen, they fail to generate enough cellular energy and die of suffocation.",
        mark_scheme: "Award up to 10 marks:\n- 2 marks for naming and defining 'eutrophication'.\n- 2 marks for linking nutrient run-off to algal bloom/growth.\n- 2 marks for describing bacterial decomposition of dead algae.\n- 2 marks for explaining bacterial oxygen consumption during aerobic respiration.\n- 2 marks for linking low oxygen / lack of photosynthesis to the suffocation and death of the fish."
      },
      {
        task_number: 2,
        task_text: "Aloni proposes that they should spray a chemical herbicide to destroy the water hyacinth completely. What advice and alternative bio-control or manual-control recommendations would you give to Aloni and the Ggaba community?",
        marks: 8,
        competency: "Creativity and innovation",
        bloom_level: "Creation",
        model_answer: "Chemical spraying is highly discouraged because the herbicide chemicals could accumulate in Tilapia tissues (bioaccumulation) and poison humans eating the fish (biomagnification). Spraying also leads to massive toxic residue, rotting plant material under water, and further oxygen depletion. \n\nInstead, I recommend a dual approach:\n1. Biological Control: Introduce the water hyacinth weevil (Neochetina eichhorniae/bruchi). These insects feed selectively on the hyacinth leaf tissues, reducing its buoyancy and allowing light penetration.\n2. Livelihood Manual Control: Harvest the weeds manually and convert them into local artisan projects like woven baskets, organic manure/compost for crop farming (such as nearby matoke farms), or biodigester fuels (biogas).\n3. Prevention: Stop the source of pollution by creating buffer wetlands near Munyonyo to filter nutrients before they flow into Lake Victoria.",
        mark_scheme: "Award up to 8 marks:\n- 2 marks for identifying risks of chemical spraying (e.g. bioaccumulation, oxygen depletion from rotting mass).\n- 2 marks for proposing selective biological control (e.g. water hyacinth weevils).\n- 2 marks for suggesting creative local community manual reuse (manure, woven materials, or biogas).\n- 2 marks for outlining prevention of nutrient runoff (wetland buffers)."
      },
      {
        task_number: 3,
        task_text: "Construct a simple food chain representing energy flow at Ggaba landing site, clearly specifying the trophic levels based on the organisms mentioned in the narrative.",
        marks: 6,
        competency: "Communication",
        bloom_level: "Comprehension",
        model_answer: "A food chain representing energy flow on the lake is:\nPhytoplankton (such as Blue-green Algae) [Producer, Trophic Level 1] ──> Nile Tilapia (Oreochromis niloticus) [Primary Consumer, Trophic Level 2] ──> Aloni/Humans [Secondary Consumer, Trophic Level 3]\n\nIn this chain, light energy is captured by the blue-green algae, converted into chemical energy via photosynthesis, and passed on to Tilapia when they graze, which is subsequently transferred to humans upon eating the Tilapia.",
        mark_scheme: "Award up to 6 marks:\n- 2 marks for writing the food chain using correct arrow directions (Producer -> Primary Consumer -> Secondary Consumer).\n- 2 marks for labeling the organisms correctly (Algae as Producer, Tilapia as Primary Consumer, Humans/Aloni as Secondary Consumer).\n- 2 marks for explaining the directional energy transfer."
      }
    ]
  },
  {
    id: "seed-jinja",
    topic: "Inheritance and Evolution (Genetics & Natural Selection)",
    class_level: "S6",
    difficulty: "Advanced",
    scenario: "In Jinja district, close to the banks of River Nile, malaria is a common life-threatening illness. Dr. Okello runs an outpatient clinic and notices an intriguing genetic pattern in the local population. Two parents, Peter and Monica, both of whom have sickle-cell trait (genotype HbA HbS), recently brought their children in for check-ups. Their eldest child, Jane, has normal hemoglobin (HbA HbA) but suffers from severe malaria episodes yearly. Their second child, David, has sickle-cell disease (HbS HbS) and struggles with painful vaso-occlusive crises. Their third child, Robert, has the sickle-cell trait (HbA HbS) like his parents. Robert rarely catches severe malaria and shows no debilitating anemia. Dr. Okello explains to Jane that the sickle-cell allele HbS persists in Jinja because of a evolutionary phenomenon called heterozygote advantage (also known as polymorphism maintained by selection pressure from malaria parasites).",
    tasks: [
      {
        task_number: 1,
        task_text: "Using genetic diagrams representing crossing between Peter and Monica, determine the genetic probability of their offspring having normal blood, sickle-cell trait, and active sickle-cell disease.",
        marks: 8,
        competency: "Critical thinking and problem-solving",
        bloom_level: "Application",
        model_answer: "Parents genotypes are both HbA HbS (heterozygous trait).\n- Gametes produced: HbA and HbS.\n- Punnett Square crossing:\n   |   | HbA       | HbS       |\n   |---|-----------|-----------|\n   |HbA| HbA HbA   | HbA HbS   |\n   |HbS| HbA HbS   | HbS HbS   |\n\n- Phenotype & Genotype Ratios:\n1. 1/4 (25%) probability of Normal hemoglobin (HbA HbA) (Jane)\n2. 2/4 or 1/2 (50%) probability of Sickle-cell Trait (HbA HbS) (Robert, Heterozygous)\n3. 1/4 (25%) probability of Sickle-cell Disease (HbS HbS) (David, Homozygous recessive)\n\nThe genetic ratio is 1 Normal : 2 Trait : 1 Disease.",
        mark_scheme: "Award up to 8 marks:\n- 2 marks for indicating correct parental genotypes (HbA HbS x HbA HbS) and their gametes.\n- 2 marks for showing a complete, correct Punnett square grid.\n- 2 marks for listing the correct genotypes of offspring (HbA HbA, HbA HbS, HbS HbS).\n- 2 marks for stating the correct probability percentages (25% Normal, 50% Trait, 25% Disease)."
      },
      {
        task_number: 2,
        task_text: "Explain why the HbS allele remains prevalent in Jinja despite David (HbS HbS) suffering from severe crises. Rely on the concept of Natural Selection and heterozygote advantage.",
        marks: 10,
        competency: "Critical thinking and problem-solving",
        bloom_level: "Analysis",
        model_answer: "In malaria-infested areas like Jinja, individuals with sickle-cell trait (HbA HbS) have a selective evolutionary advantage. Their red blood cells shape sickle-like and collapse when infected with Plasmodium falciparum, and these cells are cleared from the bloodstream by the spleen, destroying the parasite before it reproduces. This confers structural protection against lethal malaria.\n\nHomozygous normal individuals (HbA HbA) are vulnerable to malaria and may die young. Homozygous sickle-cell disease individuals (HbS HbS) are vulnerable to organic complications and anemia. Therefore, natural selection favors the heterozygotes (HbA HbS). Because heterozygotes survive and reproduce successfully, they continuously pass both the HbA and the HbS alleles to the next generation, maintaining the recessive, otherwise lethal HbS allele in the gene pool through vector selection pressure.",
        mark_scheme: "Award up to 10 marks:\n- 2 marks for explaining protection of heterozygote HbA HbS against malaria.\n- 2 marks for introducing selective death of normal HbA HbA from severe malaria.\n- 2 marks for introducing selective morbidity of homozygous HbS HbS.\n- 2 marks for stating heterozygote survival and successful reproduction.\n- 2 marks for linking this survival directly to the maintenance of the recessive HbS allele in the population's gene pool (Balancing Selection)."
      }
    ]
  },
  {
    id: "seed-mukono",
    topic: "Nutrition in Plants (Photosynthesis, C3 vs C4 Plants)",
    class_level: "S5",
    difficulty: "Advanced",
    scenario: "Mr. Mukasa owns an agricultural plot in Nakifuma, Mukono district. He grows Uganda's staple starch crop, Matooke / Bananas (Musa acuminata - a C3 plant), alongside Maize (Zea mays - a C4 plant) as an intercrop. In recent years, Mukono has experienced prolonged dry spells with high midday temperatures reaching 34°C and high light intensities. Mukasa notices that during the peak heat of the day, his Matooke leaves become soft, droop, and crop yields have dropped. In contrast, the Maize crops remain vibrant, grow rapidly, and continue producing healthy cobs. Mukasa is confused about why these two crops respond so differently to the same hot Ugandan climate. A local agro-biologist visiting his farm explains that Maize possesses a unique leaf anatomy known as Kranz anatomy, which utilizes highly efficient PEP carboxylase enzymes to suppress photorespiration under severe heat.",
    tasks: [
      {
        task_number: 1,
        task_text: "Compare the biochemical pathway of carbon dioxide fixation in Matooke (C3 plant) and Maize (C4 plant), explaining why Maize performs better under hot, dry conditions.",
        marks: 10,
        competency: "Critical thinking and problem-solving",
        bloom_level: "Analysis",
        model_answer: "Matooke (C3) fixes CO2 directly into the Calvin cycle using RuBisCO. In hot dry settings, stomata close to prevent water loss, lowering internal CO2 levels while O2 level rises. RuBisCO accepts O2 instead of CO2, initiating photorespiration which wastes up to 25% of captured energy without producing ATP or sugar.\n\nMaize (C4) resolves this using Kranz anatomy. CO2 is first fixed in the mesophyll cells by PEP Carboxylase, which has a very high affinity for CO2 and absolutely no affinity for O2. This creates oxaloacetate (4-C compound), which is converted to malate and transported into bundle sheath cells surrounding the veins. Here, malate releases high concentrations of CO2 around RuBisCO, saturating it and entirely suppressing photorespiration. The Calvin cycle runs with maximum photosynthetic efficiency even if stomata are partially closed due to heat.",
        mark_scheme: "Award up to 10 marks:\n- 2 marks for identifying Calvin cycle and RuBisCO as the primary enzyme in C3 plants.\n- 2 marks for describing photorespiration under low CO2 / high O2 in C3 plants.\n- 2 marks for identifying PEP Carboxylase as primary fixing enzyme in C4 plants.\n- 2 marks for explaining Kranz anatomy structure (Mesophyll and Bundle Sheaths spatial separation).\n- 2 marks for explaining concentration of CO2 around RuBisCO keeping photosynthetic output high."
      },
      {
        task_number: 2,
        task_text: "Design a simple irrigation and farm-management poster proposal for Mr. Mukasa to protect his valuable Matooke plantation from intense heat while optimizing intercropping yields.",
        marks: 8,
        competency: "Creativity and innovation",
        bloom_level: "Creation",
        model_answer: "We recommend a resilient agroforestry design concept for Mr. Mukasa:\n\n1. Shade Canopy Intercropping: Plant deep-rooted indigenous Ugandan shade trees (e.g., Milicia excelsa / Mvule or Albizia species) or intercrop with taller Jackfruit trees. These provide a natural cooling microclimate, shield the C3 Matooke from intense light, and decrease leaf temperature.\n2. Organic Mulching: Cover the soil around the Matooke bases with cassava peelings, maize husks, and dried grass. Mulch retains soil moisture, prevents evaporation, and stabilizes root temperatures.\n3. Micro-Drip Irrigation: Use low-cost bamboo-gravity or plastic drip pipes to deliver water directly to Matooke roots during early morning (6:00 AM) or sunset (6:30 PM), avoiding water-loss through vapor when midday heat hits.\n4. Space Layout: Align rows of maize (hot, high-light loving C4) in buffers between banana rows (sensitive C3) to act as natural windbreakers and moisture traps.",
        mark_scheme: "Award up to 8 marks:\n- 2 marks for proposing sensible shade trees (agroforestry) to create a cooler microclimate for C3 bananas.\n- 2 marks for suggesting organic mulching using farm-wastes to retain moisture.\n- 2 marks for designing water-conservation drip irrigation methods aligned with local economic capabilities.\n- 2 marks for recommending sensible spatial layout arrangements of Maize and Matooke."
      }
    ]
  }
];

export const SYLLABUS_TOPICS: { [key: string]: string[] } = {
  S1: [
    "Introduction to Biology",
    "Cells",
    "Classification",
    "The Five Kingdoms of Living Organisms",
    "Viruses",
    "Insects",
    "Flowering Plants"
  ],
  S2: [
    "Physical and Chemical Properties of Soil",
    "Soil Erosion and Conservation; Causes, Effects and Prevention",
    "Nutrition Types and Nutrient Compounds",
    "Nutrition in Green Plants",
    "Nutrition in Mammals",
    "Transport in Plants",
    "Transport in Animals"
  ],
  S3: [
    "Gaseous Exchange",
    "Aerobic Respiration and Anaerobic Respiration",
    "Excretion in Animals",
    "Chemical Coordination in Humans",
    "Nervous Coordination in Humans",
    "Receptor Organs in Man",
    "Locomotion in Mammals",
    "Growth in Plants and Animals",
    "Development in Plants and Animals"
  ],
  S4: [
    "Asexual Reproduction in Plants (Vegetative Reproduction)",
    "Sexual Reproduction in Plants",
    "Sexual Reproduction in Humans",
    "Inheritance",
    "Variation and Selection",
    "Concept of Ecology",
    "Food Chains and Food Webs",
    "Associations in Biological Communities",
    "Humans and the Natural Environment"
  ],
  S5: [
    "Cell Biology (Chemicals of Life, Microscopy & Cell Ultrastructure)",
    "Nutrition in Plants (Photosynthesis in C3 and C4 Plants)",
    "Transport in Humans and Mammals (Gas Transport & Immunology)",
    "Respiration (Mitochondrion Architecture & ATP Production)",
    "Homeostasis (Negative Feedback Control & Osmoregulation in Plants)"
  ],
  S6: [
    "Coordination (Plant Growth Regulators, Nervous Transmission, Sensory Receptors & Animal Behaviour)",
    "Inheritance and Evolution (Mendelian Genetics, Gene Tech, Selection & Speciation)",
    "Growth in Plants and Development in Insects (Germination & Metamorphosis)",
    "Ecology (Population, Ecological Succession, Ecological Chemistry & Food Security)"
  ]
};
