export const WEBSOCKET_PUBLIC_URL = "http://localhost:5505/"
export const WEBSOCKET_SERVER_PORT = 5505

const QUIZZ_CONFIG = {
  password: "PASSWORD",
  subject: "Plant",
  questions: [
    {
      question: "What is the process by which green plants make their own food?",
      answers: [
        "Respiration",
        "Photosynthesis",
        "Transpiration",
        "Fermentation"
      ],
      solution: 1,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which of the following is NOT a part of a typical plant?",
      answers: [
        "Leaf",
        "Stem",
        "Heart",
        "Root"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which plant part anchors it to the soil?",
      answers: [
        "Leaf",
        "Flower",
        "Root",
        "Stem"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "What are the two main types of root systems?",
      answers: [
        "Taproot and Fibrous",
        "Primary and Secondary",
        "Monocot and Dicot",
        "Xylem and Phloem"
      ],
      solution: 0,
      cooldown: 5,
      time: 15
    },
    {
      question: "What is the function of the stem in a plant?",
      answers: [
        "Support and transport",
        "Photosynthesis",
        "Seed production",
        "Gas exchange"
      ],
      solution: 0,
      cooldown: 5,
      time: 15
    },
    {
      question: "What is the main site of photosynthesis in a plant?",
      answers: [
        "Stem",
        "Roots",
        "Leaves",
        "Flowers"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "What pigment is essential for photosynthesis?",
      answers: [
        "Melanin",
        "Carotene",
        "Chlorophyll",
        "Hemoglobin"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "What plant part is mainly involved in reproduction?",
      answers: [
        "Leaves",
        "Roots",
        "Flowers",
        "Stems"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which tissue transports water in a plant?",
      answers: [
        "Phloem",
        "Xylem",
        "Cambium",
        "Mesophyll"
      ],
      solution: 1,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which tissue distributes food made by the leaves?",
      answers: [
        "Xylem",
        "Cambium",
        "Phloem",
        "Stomata"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "What are stomata?",
      answers: [
        "Reproductive parts of plants",
        "Parts of the stem",
        "Openings on leaves for gas exchange",
        "Root hairs"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "What gas do plants take in through stomata?",
      answers: [
        "Oxygen",
        "Carbon dioxide",
        "Nitrogen",
        "Hydrogen"
      ],
      solution: 1,
      cooldown: 5,
      time: 15
    },
    {
      question: "What is germination?",
      answers: [
        "Plant respiration",
        "Flowering process",
        "Seed developing into a plant",
        "Leaf falling"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which of the following is NOT required for germination?",
      answers: [
        "Sunlight",
        "Water",
        "Oxygen",
        "Right temperature"
      ],
      solution: 0,
      cooldown: 5,
      time: 15
    },
    {
      question: "What do monocots have?",
      answers: [
        "Two seed leaves",
        "One seed leaf",
        "No seed leaves",
        "Multiple roots only"
      ],
      solution: 1,
      cooldown: 5,
      time: 15
    },
    {
      question: "Dicots are known to have:",
      answers: [
        "One seed leaf",
        "Two seed leaves",
        "No stem",
        "Parallel leaf veins"
      ],
      solution: 1,
      cooldown: 5,
      time: 15
    },
    {
      question: "What is the main function of roots?",
      answers: [
        "Photosynthesis",
        "Reproduction",
        "Water and nutrient absorption",
        "Gas exchange"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Xylem mainly moves:",
      answers: [
        "Food",
        "Oxygen",
        "Minerals and water",
        "Carbon dioxide"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Phloem mainly moves:",
      answers: [
        "Minerals",
        "Water",
        "Glucose",
        "Sunlight"
      ],
      solution: 2,
      cooldown: 5,
      time: 15
    },
    {
      question: "Which of the following helps in gas exchange in plants?",
      answers: [
        "Chlorophyll",
        "Phloem",
        "Xylem",
        "Stomata"
      ],
      solution: 3,
      cooldown: 5,
      time: 15
    }
  ],

}

// DONT CHANGE
export const GAME_STATE_INIT = {
  started: false,
  players: [],
  playersAnswer: [],
  manager: null,
  room: null,
  currentQuestion: 0,
  roundStartTime: 0,
  ...QUIZZ_CONFIG,
}
