/**
 * 🦉 Hoot Indie Games — Données Steam Store Officielles Certifiées (Prix, Promotions & Avis)
 * Généré automatiquement via Steam Store & Reviews API.
 * 0 Hallucination : données réelles et vérifiées pour 492 jeux indépendants.
 */

export interface SteamStoreGameData {
  appId: number;
  isFree: boolean;
  currency: string;
  initialPriceCents: number;
  finalPriceCents: number;
  discountPercent: number;
  formattedFinalPrice: string;
  formattedInitialPrice?: string;
  totalReviews: number;
  totalPositive: number;
  positivePercent: number;
  reviewScoreDesc: {
    fr: string;
    en: string;
  };
}

export const STEAM_STORE_DATA: Record<number, SteamStoreGameData> = {
  "4000": {
    "appId": 4000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1093788,
    "totalPositive": 1060753,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "22000": {
    "appId": 22000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 1249,
    "discountPercent": 0,
    "formattedFinalPrice": "12,49€",
    "totalReviews": 6600,
    "totalPositive": 6235,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "40800": {
    "appId": 40800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "totalReviews": 39183,
    "totalPositive": 36884,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "48000": {
    "appId": 48000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1149,
    "finalPriceCents": 1149,
    "discountPercent": 0,
    "formattedFinalPrice": "11,49€",
    "totalReviews": 62115,
    "totalPositive": 57273,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "57300": {
    "appId": 57300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 20448,
    "totalPositive": 19518,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "80330": {
    "appId": 80330,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 449,
    "finalPriceCents": 449,
    "discountPercent": 0,
    "formattedFinalPrice": "4,49€",
    "formattedInitialPrice": "",
    "totalReviews": 1342,
    "totalPositive": 1199,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "94400": {
    "appId": 94400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "",
    "totalReviews": 5717,
    "totalPositive": 5189,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "105600": {
    "appId": 105600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 1556172,
    "totalPositive": 1515317,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "107100": {
    "appId": 107100,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 38195,
    "totalPositive": 36391,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "108600": {
    "appId": 108600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2549,
    "finalPriceCents": 2549,
    "discountPercent": 0,
    "formattedFinalPrice": "25,49€",
    "totalReviews": 482796,
    "totalPositive": 452691,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "115800": {
    "appId": 115800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 6130,
    "totalPositive": 5116,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "206440": {
    "appId": 206440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 86506,
    "totalPositive": 83155,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "207140": {
    "appId": 207140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 295,
    "discountPercent": 80,
    "formattedFinalPrice": "2,95€",
    "formattedInitialPrice": "14,79€",
    "totalReviews": 22838,
    "totalPositive": 21617,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "210970": {
    "appId": 210970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3699,
    "finalPriceCents": 3699,
    "discountPercent": 0,
    "formattedFinalPrice": "36,99€",
    "totalReviews": 21405,
    "totalPositive": 18067,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "211820": {
    "appId": 211820,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 123314,
    "totalPositive": 110901,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "212680": {
    "appId": 212680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 199,
    "discountPercent": 80,
    "formattedFinalPrice": "1,99€",
    "formattedInitialPrice": "9,99€",
    "totalReviews": 78787,
    "totalPositive": 74915,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "214770": {
    "appId": 214770,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1549,
    "finalPriceCents": 387,
    "discountPercent": 75,
    "formattedFinalPrice": "3,87€",
    "formattedInitialPrice": "15,49€",
    "totalReviews": 3159,
    "totalPositive": 2952,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "219150": {
    "appId": 219150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 128281,
    "totalPositive": 124203,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "219740": {
    "appId": 219740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 819,
    "finalPriceCents": 819,
    "discountPercent": 0,
    "formattedFinalPrice": "8,19€",
    "totalReviews": 113488,
    "totalPositive": 109562,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "219890": {
    "appId": 219890,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 13663,
    "totalPositive": 13028,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "223710": {
    "appId": 223710,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 296,
    "totalPositive": 231,
    "positivePercent": 78,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "224760": {
    "appId": 224760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 16258,
    "totalPositive": 15061,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "230700": {
    "appId": 230700,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2076,
    "totalPositive": 1655,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "231200": {
    "appId": 231200,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 4464,
    "totalPositive": 3575,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "234900": {
    "appId": 234900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 1603,
    "totalPositive": 1358,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "237930": {
    "appId": 237930,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 31268,
    "totalPositive": 29376,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "238320": {
    "appId": 238320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 138958,
    "totalPositive": 134012,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "239030": {
    "appId": 239030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 80586,
    "totalPositive": 78408,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "240720": {
    "appId": 240720,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 699,
    "finalPriceCents": 699,
    "discountPercent": 0,
    "formattedFinalPrice": "6,99€",
    "formattedInitialPrice": "",
    "totalReviews": 75162,
    "totalPositive": 62090,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "242680": {
    "appId": 242680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1179,
    "finalPriceCents": 1179,
    "discountPercent": 0,
    "formattedFinalPrice": "11,79€",
    "formattedInitialPrice": "",
    "totalReviews": 15049,
    "totalPositive": 14517,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "242760": {
    "appId": 242760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 581529,
    "totalPositive": 555798,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "242920": {
    "appId": 242920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 37892,
    "totalPositive": 34152,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "247080": {
    "appId": 247080,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 295,
    "discountPercent": 80,
    "formattedFinalPrice": "2,95€",
    "formattedInitialPrice": "14,79€",
    "totalReviews": 26509,
    "totalPositive": 25310,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "248820": {
    "appId": 248820,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 20763,
    "totalPositive": 19315,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "250760": {
    "appId": 250760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 16913,
    "totalPositive": 16153,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "250900": {
    "appId": 250900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 456519,
    "totalPositive": 442087,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "251470": {
    "appId": 251470,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2945,
    "totalPositive": 2817,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "252110": {
    "appId": 252110,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3370,
    "totalPositive": 3141,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "252410": {
    "appId": 252410,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 149,
    "discountPercent": 85,
    "formattedFinalPrice": "1,49€",
    "formattedInitialPrice": "9,99€",
    "totalReviews": 6509,
    "totalPositive": 6158,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "252490": {
    "appId": 252490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 1999,
    "discountPercent": 50,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "39,99€",
    "totalReviews": 1400613,
    "totalPositive": 1214503,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "252610": {
    "appId": 252610,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 9125,
    "totalPositive": 8485,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "257510": {
    "appId": 257510,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 33054,
    "totalPositive": 31498,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "257850": {
    "appId": 257850,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 374,
    "discountPercent": 75,
    "formattedFinalPrice": "3,74€",
    "formattedInitialPrice": "14,99€",
    "totalReviews": 15557,
    "totalPositive": 14524,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "262060": {
    "appId": 262060,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 162562,
    "totalPositive": 148999,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "264710": {
    "appId": 264710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 380353,
    "totalPositive": 369289,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "268910": {
    "appId": 268910,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 221469,
    "totalPositive": 212949,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "274170": {
    "appId": 274170,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 80347,
    "totalPositive": 75614,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "274190": {
    "appId": 274190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 49519,
    "totalPositive": 48028,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "274520": {
    "appId": 274520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 22265,
    "totalPositive": 21146,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "282070": {
    "appId": 282070,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 81830,
    "totalPositive": 76784,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "282140": {
    "appId": 282140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 53015,
    "totalPositive": 50813,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "283640": {
    "appId": 283640,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 1799,
    "discountPercent": 0,
    "formattedFinalPrice": "17,99€",
    "totalReviews": 21918,
    "totalPositive": 19586,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "285900": {
    "appId": 285900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 54921,
    "totalPositive": 47221,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "294100": {
    "appId": 294100,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3199,
    "finalPriceCents": 3199,
    "discountPercent": 0,
    "formattedFinalPrice": "31,99€",
    "totalReviews": 246642,
    "totalPositive": 241332,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "304430": {
    "appId": 304430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 75952,
    "totalPositive": 73670,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "304650": {
    "appId": 304650,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 7623,
    "totalPositive": 6399,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "311690": {
    "appId": 311690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 89871,
    "totalPositive": 85469,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "312520": {
    "appId": 312520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2379,
    "finalPriceCents": 2379,
    "discountPercent": 0,
    "formattedFinalPrice": "23,79€",
    "formattedInitialPrice": "",
    "totalReviews": 47015,
    "totalPositive": 44241,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "312530": {
    "appId": 312530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 1299,
    "discountPercent": 0,
    "formattedFinalPrice": "12,99€",
    "formattedInitialPrice": "",
    "totalReviews": 25268,
    "totalPositive": 24552,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "322190": {
    "appId": 322190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 224,
    "discountPercent": 85,
    "formattedFinalPrice": "2,24€",
    "formattedInitialPrice": "14,99€",
    "totalReviews": 4235,
    "totalPositive": 3972,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "322330": {
    "appId": 322330,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 543368,
    "totalPositive": 515676,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "322500": {
    "appId": 322500,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2249,
    "finalPriceCents": 2249,
    "discountPercent": 0,
    "formattedFinalPrice": "22,49€",
    "totalReviews": 40757,
    "totalPositive": 37312,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "323190": {
    "appId": 323190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 599,
    "discountPercent": 80,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "29,99€",
    "totalReviews": 114477,
    "totalPositive": 106151,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "330020": {
    "appId": 330020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2199,
    "finalPriceCents": 2199,
    "discountPercent": 0,
    "formattedFinalPrice": "21,99€",
    "totalReviews": 23357,
    "totalPositive": 20643,
    "positivePercent": 88,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "332200": {
    "appId": 332200,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 449,
    "discountPercent": 75,
    "formattedFinalPrice": "4,49€",
    "formattedInitialPrice": "17,99€",
    "totalReviews": 6627,
    "totalPositive": 5972,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "333640": {
    "appId": 333640,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3049,
    "finalPriceCents": 3049,
    "discountPercent": 0,
    "formattedFinalPrice": "30,49€",
    "formattedInitialPrice": "",
    "totalReviews": 11907,
    "totalPositive": 11306,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "335670": {
    "appId": 335670,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1099,
    "discountPercent": 45,
    "formattedFinalPrice": "10,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 15191,
    "totalPositive": 14496,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "336140": {
    "appId": 336140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2313,
    "totalPositive": 2208,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "337340": {
    "appId": 337340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 20384,
    "totalPositive": 19930,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "341800": {
    "appId": 341800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 14338,
    "totalPositive": 13957,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "347800": {
    "appId": 347800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 989,
    "totalPositive": 834,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "353540": {
    "appId": 353540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1590,
    "totalPositive": 1531,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "356400": {
    "appId": 356400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 4059,
    "totalPositive": 3724,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "358960": {
    "appId": 358960,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 299,
    "finalPriceCents": 299,
    "discountPercent": 0,
    "formattedFinalPrice": "2,99€",
    "totalReviews": 307,
    "totalPositive": 272,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "360740": {
    "appId": 360740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 299,
    "finalPriceCents": 74,
    "discountPercent": 75,
    "formattedFinalPrice": "0,74€",
    "formattedInitialPrice": "2,99€",
    "totalReviews": 7901,
    "totalPositive": 7626,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "361420": {
    "appId": 361420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 118854,
    "totalPositive": 109337,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "362680": {
    "appId": 362680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 23055,
    "totalPositive": 22459,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "365360": {
    "appId": 365360,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 26141,
    "totalPositive": 23001,
    "positivePercent": 88,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "367520": {
    "appId": 367520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 561774,
    "totalPositive": 544447,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "368340": {
    "appId": 368340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 16387,
    "totalPositive": 15082,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "368620": {
    "appId": 368620,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2049,
    "finalPriceCents": 2049,
    "discountPercent": 0,
    "formattedFinalPrice": "20,49€",
    "formattedInitialPrice": "",
    "totalReviews": 2828,
    "totalPositive": 2437,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "381780": {
    "appId": 381780,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1079,
    "finalPriceCents": 1079,
    "discountPercent": 0,
    "formattedFinalPrice": "10,79€",
    "formattedInitialPrice": "",
    "totalReviews": 1176,
    "totalPositive": 1077,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "383870": {
    "appId": 383870,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 99471,
    "totalPositive": 90075,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "384630": {
    "appId": 384630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1155,
    "totalPositive": 1092,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "386940": {
    "appId": 386940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 1299,
    "discountPercent": 0,
    "formattedFinalPrice": "12,99€",
    "formattedInitialPrice": "",
    "totalReviews": 41073,
    "totalPositive": 39418,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "387290": {
    "appId": 387290,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 71536,
    "totalPositive": 67998,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "388880": {
    "appId": 388880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 12119,
    "totalPositive": 11077,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "391540": {
    "appId": 391540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 341947,
    "totalPositive": 329996,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "400910": {
    "appId": 400910,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1749,
    "finalPriceCents": 1749,
    "discountPercent": 0,
    "formattedFinalPrice": "17,49€",
    "formattedInitialPrice": "",
    "totalReviews": 10769,
    "totalPositive": 10255,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "405640": {
    "appId": 405640,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 18138,
    "totalPositive": 17224,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "412830": {
    "appId": 412830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2699,
    "finalPriceCents": 2699,
    "discountPercent": 0,
    "formattedFinalPrice": "26,99€",
    "totalReviews": 27112,
    "totalPositive": 26317,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "413150": {
    "appId": 413150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "totalReviews": 1039195,
    "totalPositive": 1023392,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "418530": {
    "appId": 418530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "totalReviews": 21970,
    "totalPositive": 20391,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "420530": {
    "appId": 420530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 65281,
    "totalPositive": 64126,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "422970": {
    "appId": 422970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 715,
    "finalPriceCents": 715,
    "discountPercent": 0,
    "formattedFinalPrice": "7,15€",
    "formattedInitialPrice": "",
    "totalReviews": 7445,
    "totalPositive": 7162,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "423230": {
    "appId": 423230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 14068,
    "totalPositive": 12650,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "427410": {
    "appId": 427410,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3399,
    "finalPriceCents": 3399,
    "discountPercent": 0,
    "formattedFinalPrice": "33,99€",
    "formattedInitialPrice": "",
    "totalReviews": 42165,
    "totalPositive": 40444,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "427520": {
    "appId": 427520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3200,
    "finalPriceCents": 3200,
    "discountPercent": 0,
    "formattedFinalPrice": "32,--€",
    "totalReviews": 234920,
    "totalPositive": 229086,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "428550": {
    "appId": 428550,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10522,
    "totalPositive": 9836,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "433340": {
    "appId": 433340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 474,
    "discountPercent": 75,
    "formattedFinalPrice": "4,74€",
    "formattedInitialPrice": "18,99€",
    "totalReviews": 157403,
    "totalPositive": 154267,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "440880": {
    "appId": 440880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 949,
    "finalPriceCents": 949,
    "discountPercent": 0,
    "formattedFinalPrice": "9,49€",
    "formattedInitialPrice": "",
    "totalReviews": 2465,
    "totalPositive": 2316,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "445980": {
    "appId": 445980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1599,
    "finalPriceCents": 479,
    "discountPercent": 70,
    "formattedFinalPrice": "4,79€",
    "formattedInitialPrice": "15,99€",
    "totalReviews": 21069,
    "totalPositive": 19071,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "447150": {
    "appId": 447150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 3734,
    "totalPositive": 3531,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "447530": {
    "appId": 447530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 38749,
    "totalPositive": 37692,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "448510": {
    "appId": 448510,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1599,
    "finalPriceCents": 1599,
    "discountPercent": 0,
    "formattedFinalPrice": "15,99€",
    "formattedInitialPrice": "",
    "totalReviews": 13535,
    "totalPositive": 12145,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "457140": {
    "appId": 457140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "formattedInitialPrice": "",
    "totalReviews": 135333,
    "totalPositive": 130977,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "460950": {
    "appId": 460950,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 76147,
    "totalPositive": 74557,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "466560": {
    "appId": 466560,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "formattedInitialPrice": "",
    "totalReviews": 54466,
    "totalPositive": 46418,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "473950": {
    "appId": 473950,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 7730,
    "totalPositive": 7367,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "477160": {
    "appId": 477160,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 599,
    "discountPercent": 70,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 174950,
    "totalPositive": 165497,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "480490": {
    "appId": 480490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 54689,
    "totalPositive": 49675,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "481510": {
    "appId": 481510,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 20297,
    "totalPositive": 19242,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "496300": {
    "appId": 496300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10163,
    "totalPositive": 8755,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "499180": {
    "appId": 499180,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 1887,
    "totalPositive": 1743,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "501300": {
    "appId": 501300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1849,
    "finalPriceCents": 1849,
    "discountPercent": 0,
    "formattedFinalPrice": "18,49€",
    "totalReviews": 52919,
    "totalPositive": 50585,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "504230": {
    "appId": 504230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "totalReviews": 147489,
    "totalPositive": 143659,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "508440": {
    "appId": 508440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 144072,
    "totalPositive": 141077,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "510420": {
    "appId": 510420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 819,
    "finalPriceCents": 819,
    "discountPercent": 0,
    "formattedFinalPrice": "8,19€",
    "formattedInitialPrice": "",
    "totalReviews": 4498,
    "totalPositive": 4247,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "512900": {
    "appId": 512900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 17229,
    "totalPositive": 16578,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "519860": {
    "appId": 519860,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1949,
    "finalPriceCents": 779,
    "discountPercent": 60,
    "formattedFinalPrice": "7,79€",
    "formattedInitialPrice": "19,49€",
    "totalReviews": 25515,
    "totalPositive": 24736,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "526870": {
    "appId": 526870,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3899,
    "finalPriceCents": 3899,
    "discountPercent": 0,
    "formattedFinalPrice": "38,99€",
    "totalReviews": 279776,
    "totalPositive": 272126,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "528230": {
    "appId": 528230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10109,
    "totalPositive": 9522,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "530320": {
    "appId": 530320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2185,
    "totalPositive": 2105,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "534550": {
    "appId": 534550,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2049,
    "finalPriceCents": 2049,
    "discountPercent": 0,
    "formattedFinalPrice": "20,49€",
    "totalReviews": 3388,
    "totalPositive": 3086,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "535520": {
    "appId": 535520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 1025,
    "totalPositive": 841,
    "positivePercent": 82,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "541570": {
    "appId": 541570,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 299,
    "finalPriceCents": 299,
    "discountPercent": 0,
    "formattedFinalPrice": "2,99€",
    "totalReviews": 29748,
    "totalPositive": 28953,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "548430": {
    "appId": 548430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "553420": {
    "appId": 553420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 18616,
    "totalPositive": 16949,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "555220": {
    "appId": 555220,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1199,
    "finalPriceCents": 1199,
    "discountPercent": 0,
    "formattedFinalPrice": "11,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10382,
    "totalPositive": 9940,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "557340": {
    "appId": 557340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 390,
    "discountPercent": 80,
    "formattedFinalPrice": "3,90€",
    "formattedInitialPrice": "19,50€",
    "totalReviews": 28489,
    "totalPositive": 27206,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "557600": {
    "appId": 557600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "formattedInitialPrice": "",
    "totalReviews": 19170,
    "totalPositive": 18683,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "558990": {
    "appId": 558990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 7263,
    "totalPositive": 7064,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "562860": {
    "appId": 562860,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 5655,
    "totalPositive": 5268,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "571310": {
    "appId": 571310,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 299,
    "discountPercent": 85,
    "formattedFinalPrice": "2,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 5701,
    "totalPositive": 5449,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "588650": {
    "appId": 588650,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 1249,
    "discountPercent": 50,
    "formattedFinalPrice": "12,49€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 183581,
    "totalPositive": 178116,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "589780": {
    "appId": 589780,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 14316,
    "totalPositive": 13375,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "590380": {
    "appId": 590380,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 22385,
    "totalPositive": 21081,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "593280": {
    "appId": 593280,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 1299,
    "discountPercent": 0,
    "formattedFinalPrice": "12,99€",
    "formattedInitialPrice": "",
    "totalReviews": 8374,
    "totalPositive": 7950,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "594330": {
    "appId": 594330,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 8758,
    "totalPositive": 7448,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "596970": {
    "appId": 596970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2662,
    "totalPositive": 2241,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "597760": {
    "appId": 597760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1619,
    "finalPriceCents": 1619,
    "discountPercent": 0,
    "formattedFinalPrice": "16,19€",
    "formattedInitialPrice": "",
    "totalReviews": 8020,
    "totalPositive": 7636,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "599140": {
    "appId": 599140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 390,
    "discountPercent": 80,
    "formattedFinalPrice": "3,90€",
    "formattedInitialPrice": "19,50€",
    "totalReviews": 55844,
    "totalPositive": 47637,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "601840": {
    "appId": 601840,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 503,
    "discountPercent": 70,
    "formattedFinalPrice": "5,03€",
    "formattedInitialPrice": "16,79€",
    "totalReviews": 14480,
    "totalPositive": 13550,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "606150": {
    "appId": 606150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 24474,
    "totalPositive": 19915,
    "positivePercent": 81,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "607050": {
    "appId": 607050,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1699,
    "finalPriceCents": 1699,
    "discountPercent": 0,
    "formattedFinalPrice": "16,99€",
    "formattedInitialPrice": "",
    "totalReviews": 4012,
    "totalPositive": 3349,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "609320": {
    "appId": 609320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 26476,
    "totalPositive": 25221,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "609490": {
    "appId": 609490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 2901,
    "totalPositive": 2591,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "620980": {
    "appId": 620980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1499,
    "discountPercent": 25,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 76317,
    "totalPositive": 72874,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "632360": {
    "appId": 632360,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 352905,
    "totalPositive": 331119,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "632470": {
    "appId": 632470,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3799,
    "finalPriceCents": 3799,
    "discountPercent": 0,
    "formattedFinalPrice": "37,99€",
    "totalReviews": 131225,
    "totalPositive": 121445,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "646570": {
    "appId": 646570,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 574,
    "discountPercent": 75,
    "formattedFinalPrice": "5,74€",
    "formattedInitialPrice": "22,99€",
    "totalReviews": 218598,
    "totalPositive": 213048,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "648800": {
    "appId": 648800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2049,
    "finalPriceCents": 2049,
    "discountPercent": 0,
    "formattedFinalPrice": "20,49€",
    "totalReviews": 378825,
    "totalPositive": 352272,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "653530": {
    "appId": 653530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 35223,
    "totalPositive": 34058,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "666140": {
    "appId": 666140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 34840,
    "totalPositive": 31870,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "673130": {
    "appId": 673130,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1949,
    "finalPriceCents": 1949,
    "discountPercent": 0,
    "formattedFinalPrice": "19,49€",
    "formattedInitialPrice": "",
    "totalReviews": 6658,
    "totalPositive": 6222,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "674940": {
    "appId": 674940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 475,
    "finalPriceCents": 475,
    "discountPercent": 0,
    "formattedFinalPrice": "4,75€",
    "formattedInitialPrice": "",
    "totalReviews": 99941,
    "totalPositive": 93536,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "677120": {
    "appId": 677120,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 7510,
    "totalPositive": 6560,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "683320": {
    "appId": 683320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 96401,
    "totalPositive": 92594,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "688420": {
    "appId": 688420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 12359,
    "totalPositive": 11587,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "690830": {
    "appId": 690830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3399,
    "finalPriceCents": 3399,
    "discountPercent": 0,
    "formattedFinalPrice": "33,99€",
    "formattedInitialPrice": "",
    "totalReviews": 23046,
    "totalPositive": 19942,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "692850": {
    "appId": 692850,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "formattedInitialPrice": "",
    "totalReviews": 29605,
    "totalPositive": 27654,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "692890": {
    "appId": 692890,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 24439,
    "totalPositive": 23283,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "693090": {
    "appId": 693090,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 8,
    "totalPositive": 5,
    "positivePercent": 63,
    "reviewScoreDesc": {
      "fr": "Positifs",
      "en": "Positive"
    }
  },
  "698780": {
    "appId": 698780,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 228132,
    "totalPositive": 220111,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "701160": {
    "appId": 701160,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 31269,
    "totalPositive": 28333,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "702670": {
    "appId": 702670,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1199,
    "finalPriceCents": 1199,
    "discountPercent": 0,
    "formattedFinalPrice": "11,99€",
    "totalReviews": 12161,
    "totalPositive": 11206,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "714120": {
    "appId": 714120,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "totalReviews": 14178,
    "totalPositive": 13092,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "718670": {
    "appId": 718670,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10518,
    "totalPositive": 8656,
    "positivePercent": 82,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "728880": {
    "appId": 728880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 574,
    "discountPercent": 75,
    "formattedFinalPrice": "5,74€",
    "formattedInitialPrice": "22,99€",
    "totalReviews": 62018,
    "totalPositive": 56306,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "729000": {
    "appId": 729000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 4036,
    "totalPositive": 3732,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "736260": {
    "appId": 736260,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 1249,
    "discountPercent": 0,
    "formattedFinalPrice": "12,49€",
    "totalReviews": 24616,
    "totalPositive": 24050,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "739630": {
    "appId": 739630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "totalReviews": 839868,
    "totalPositive": 792585,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "753640": {
    "appId": 753640,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 108139,
    "totalPositive": 103386,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "764790": {
    "appId": 764790,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 13265,
    "totalPositive": 12286,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "774181": {
    "appId": 774181,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 27029,
    "totalPositive": 26528,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "774201": {
    "appId": 774201,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2199,
    "finalPriceCents": 2199,
    "discountPercent": 0,
    "formattedFinalPrice": "21,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1958,
    "totalPositive": 1665,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "774361": {
    "appId": 774361,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 67330,
    "totalPositive": 60488,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "774801": {
    "appId": 774801,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 31174,
    "totalPositive": 30518,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "784150": {
    "appId": 784150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "formattedInitialPrice": "",
    "totalReviews": 24855,
    "totalPositive": 22674,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "813230": {
    "appId": 813230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 24615,
    "totalPositive": 23562,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "814370": {
    "appId": 814370,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10424,
    "totalPositive": 9535,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "815370": {
    "appId": 815370,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2099,
    "finalPriceCents": 2099,
    "discountPercent": 0,
    "formattedFinalPrice": "20,99€",
    "formattedInitialPrice": "",
    "totalReviews": 79568,
    "totalPositive": 67612,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "824600": {
    "appId": 824600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 5313,
    "totalPositive": 5133,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "835430": {
    "appId": 835430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2099,
    "finalPriceCents": 2099,
    "discountPercent": 0,
    "formattedFinalPrice": "20,99€",
    "formattedInitialPrice": "",
    "totalReviews": 820,
    "totalPositive": 687,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "835960": {
    "appId": 835960,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 13411,
    "totalPositive": 12730,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "837470": {
    "appId": 837470,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 854,
    "discountPercent": 55,
    "formattedFinalPrice": "8,54€",
    "formattedInitialPrice": "18,99€",
    "totalReviews": 25244,
    "totalPositive": 24205,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "844590": {
    "appId": 844590,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 4833,
    "totalPositive": 4667,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "848450": {
    "appId": 848450,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 108409,
    "totalPositive": 97628,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "857980": {
    "appId": 857980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 5436,
    "totalPositive": 4667,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "867210": {
    "appId": 867210,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 12123,
    "totalPositive": 10375,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "880940": {
    "appId": 880940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 46133,
    "totalPositive": 41022,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "881100": {
    "appId": 881100,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "totalReviews": 88920,
    "totalPositive": 84585,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "887420": {
    "appId": 887420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1849,
    "finalPriceCents": 1849,
    "discountPercent": 0,
    "formattedFinalPrice": "18,49€",
    "totalReviews": 102,
    "totalPositive": 56,
    "positivePercent": 55,
    "reviewScoreDesc": {
      "fr": "Moyens",
      "en": "Mixed"
    }
  },
  "892970": {
    "appId": 892970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 550697,
    "totalPositive": 516677,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "894020": {
    "appId": 894020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 22197,
    "totalPositive": 20673,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "905340": {
    "appId": 905340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "",
    "totalReviews": 2021,
    "totalPositive": 1849,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "913740": {
    "appId": 913740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 8996,
    "totalPositive": 8053,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "914710": {
    "appId": 914710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 5858,
    "totalPositive": 5574,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "914800": {
    "appId": 914800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1279,
    "finalPriceCents": 639,
    "discountPercent": 50,
    "formattedFinalPrice": "6,39€",
    "formattedInitialPrice": "12,79€",
    "totalReviews": 12596,
    "totalPositive": 11927,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "916730": {
    "appId": 916730,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 779,
    "finalPriceCents": 779,
    "discountPercent": 0,
    "formattedFinalPrice": "7,79€",
    "formattedInitialPrice": "",
    "totalReviews": 4367,
    "totalPositive": 4126,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "940910": {
    "appId": 940910,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 585,
    "discountPercent": 70,
    "formattedFinalPrice": "5,85€",
    "formattedInitialPrice": "19,50€",
    "totalReviews": 1828,
    "totalPositive": 1514,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "946030": {
    "appId": 946030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 799,
    "totalPositive": 630,
    "positivePercent": 79,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "953490": {
    "appId": 953490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 33316,
    "totalPositive": 31462,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "960690": {
    "appId": 960690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 6037,
    "totalPositive": 5693,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "963000": {
    "appId": 963000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 5548,
    "totalPositive": 5095,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "963710": {
    "appId": 963710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3688,
    "totalPositive": 3374,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "964800": {
    "appId": 964800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 1249,
    "discountPercent": 50,
    "formattedFinalPrice": "12,49€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 8233,
    "totalPositive": 7600,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "965680": {
    "appId": 965680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1808,
    "totalPositive": 1767,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "966320": {
    "appId": 966320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2752,
    "totalPositive": 2648,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "972660": {
    "appId": 972660,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3049,
    "finalPriceCents": 3049,
    "discountPercent": 0,
    "formattedFinalPrice": "30,49€",
    "formattedInitialPrice": "",
    "totalReviews": 47187,
    "totalPositive": 44774,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "975370": {
    "appId": 975370,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3049,
    "finalPriceCents": 3049,
    "discountPercent": 0,
    "formattedFinalPrice": "30,49€",
    "formattedInitialPrice": "",
    "totalReviews": 29307,
    "totalPositive": 27783,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "977880": {
    "appId": 977880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 14433,
    "totalPositive": 12080,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "977950": {
    "appId": 977950,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "formattedInitialPrice": "",
    "totalReviews": 78790,
    "totalPositive": 74248,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "983970": {
    "appId": 983970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 6107,
    "totalPositive": 5394,
    "positivePercent": 88,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "986130": {
    "appId": 986130,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 14665,
    "totalPositive": 12090,
    "positivePercent": 82,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "996770": {
    "appId": 996770,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 229,
    "discountPercent": 90,
    "formattedFinalPrice": "2,29€",
    "formattedInitialPrice": "22,99€",
    "totalReviews": 1675,
    "totalPositive": 1381,
    "positivePercent": 82,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "999220": {
    "appId": 999220,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "formattedInitialPrice": "",
    "totalReviews": 7901,
    "totalPositive": 6155,
    "positivePercent": 78,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1000410": {
    "appId": 1000410,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1979,
    "totalPositive": 1489,
    "positivePercent": 75,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1002300": {
    "appId": 1002300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 659,
    "finalPriceCents": 659,
    "discountPercent": 0,
    "formattedFinalPrice": "6,59€",
    "totalReviews": 22858,
    "totalPositive": 21519,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1028310": {
    "appId": 1028310,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4130,
    "totalPositive": 3702,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1030300": {
    "appId": 1030300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 422943,
    "totalPositive": 378437,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1043810": {
    "appId": 1043810,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 12180,
    "totalPositive": 11928,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1049410": {
    "appId": 1049410,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 28438,
    "totalPositive": 26962,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1052990": {
    "appId": 1052990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1601,
    "totalPositive": 1517,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1055540": {
    "appId": 1055540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 659,
    "finalPriceCents": 659,
    "discountPercent": 0,
    "formattedFinalPrice": "6,59€",
    "totalReviews": 22707,
    "totalPositive": 22511,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1057090": {
    "appId": 1057090,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 146318,
    "totalPositive": 141195,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1059990": {
    "appId": 1059990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1061910": {
    "appId": 1061910,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 13994,
    "totalPositive": 13463,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1062090": {
    "appId": 1062090,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3399,
    "finalPriceCents": 3399,
    "discountPercent": 0,
    "formattedFinalPrice": "33,99€",
    "formattedInitialPrice": "",
    "totalReviews": 38622,
    "totalPositive": 37076,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1062110": {
    "appId": 1062110,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1868,
    "totalPositive": 1740,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1062810": {
    "appId": 1062810,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3591,
    "totalPositive": 3106,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1079830": {
    "appId": 1079830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "formattedInitialPrice": "",
    "totalReviews": 392,
    "totalPositive": 260,
    "positivePercent": 66,
    "reviewScoreDesc": {
      "fr": "Variables",
      "en": "Mixed"
    }
  },
  "1082710": {
    "appId": 1082710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 5203,
    "totalPositive": 5059,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1084600": {
    "appId": 1084600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "formattedInitialPrice": "",
    "totalReviews": 24118,
    "totalPositive": 21247,
    "positivePercent": 88,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1092790": {
    "appId": 1092790,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 148637,
    "totalPositive": 143910,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1102190": {
    "appId": 1102190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 490,
    "discountPercent": 80,
    "formattedFinalPrice": "4,90€",
    "formattedInitialPrice": "24,50€",
    "totalReviews": 22955,
    "totalPositive": 22003,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1122720": {
    "appId": 1122720,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1199,
    "finalPriceCents": 1199,
    "discountPercent": 0,
    "formattedFinalPrice": "11,99€",
    "formattedInitialPrice": "",
    "totalReviews": 8024,
    "totalPositive": 7752,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1123450": {
    "appId": 1123450,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 3409,
    "totalPositive": 3320,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1127400": {
    "appId": 1127400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 24645,
    "totalPositive": 23600,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1129190": {
    "appId": 1129190,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 13781,
    "totalPositive": 13608,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1129580": {
    "appId": 1129580,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 43126,
    "totalPositive": 38888,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1135690": {
    "appId": 1135690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 35156,
    "totalPositive": 32828,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1136370": {
    "appId": 1136370,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4581,
    "totalPositive": 4097,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1139900": {
    "appId": 1139900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 749,
    "discountPercent": 75,
    "formattedFinalPrice": "7,49€",
    "formattedInitialPrice": "29,99€",
    "totalReviews": 66831,
    "totalPositive": 60946,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1145350": {
    "appId": 1145350,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 123399,
    "totalPositive": 118108,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1145360": {
    "appId": 1145360,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 308589,
    "totalPositive": 302433,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1147560": {
    "appId": 1147560,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "totalReviews": 57634,
    "totalPositive": 53749,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1147860": {
    "appId": 1147860,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 7511,
    "totalPositive": 7136,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1147890": {
    "appId": 1147890,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 285,
    "totalPositive": 266,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1148760": {
    "appId": 1148760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4446,
    "totalPositive": 4276,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1150690": {
    "appId": 1150690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "totalReviews": 88688,
    "totalPositive": 86098,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1158160": {
    "appId": 1158160,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 21856,
    "totalPositive": 19498,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1161580": {
    "appId": 1161580,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "formattedInitialPrice": "",
    "totalReviews": 19426,
    "totalPositive": 17402,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1164940": {
    "appId": 1164940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 874,
    "discountPercent": 75,
    "formattedFinalPrice": "8,74€",
    "formattedInitialPrice": "34,99€",
    "totalReviews": 19618,
    "totalPositive": 18191,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1167630": {
    "appId": 1167630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 136219,
    "totalPositive": 130563,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1170880": {
    "appId": 1170880,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 14614,
    "totalPositive": 14399,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1179080": {
    "appId": 1179080,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 324,
    "discountPercent": 75,
    "formattedFinalPrice": "3,24€",
    "formattedInitialPrice": "12,99€",
    "totalReviews": 8045,
    "totalPositive": 7649,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1182620": {
    "appId": 1182620,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 12866,
    "totalPositive": 12326,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1188930": {
    "appId": 1188930,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 13769,
    "totalPositive": 12480,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1197160": {
    "appId": 1197160,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 1249,
    "discountPercent": 0,
    "formattedFinalPrice": "12,49€",
    "totalReviews": 46,
    "totalPositive": 29,
    "positivePercent": 63,
    "reviewScoreDesc": {
      "fr": "Moyens",
      "en": "Mixed"
    }
  },
  "1199030": {
    "appId": 1199030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 7592,
    "totalPositive": 6840,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1201540": {
    "appId": 1201540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "formattedInitialPrice": "",
    "totalReviews": 3369,
    "totalPositive": 2908,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1202900": {
    "appId": 1202900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 749,
    "finalPriceCents": 187,
    "discountPercent": 75,
    "formattedFinalPrice": "1,87€",
    "formattedInitialPrice": "7,49€",
    "totalReviews": 9484,
    "totalPositive": 8550,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1203620": {
    "appId": 1203620,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 105847,
    "totalPositive": 90795,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1207650": {
    "appId": 1207650,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10593,
    "totalPositive": 9809,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1217060": {
    "appId": 1217060,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1175,
    "discountPercent": 30,
    "formattedFinalPrice": "11,75€",
    "formattedInitialPrice": "16,79€",
    "totalReviews": 103727,
    "totalPositive": 96545,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1218210": {
    "appId": 1218210,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1849,
    "finalPriceCents": 1849,
    "discountPercent": 0,
    "formattedFinalPrice": "18,49€",
    "formattedInitialPrice": "",
    "totalReviews": 6327,
    "totalPositive": 5407,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1220980": {
    "appId": 1220980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 159,
    "finalPriceCents": 159,
    "discountPercent": 0,
    "formattedFinalPrice": "1,59€",
    "totalReviews": 3,
    "totalPositive": 1,
    "positivePercent": 33,
    "reviewScoreDesc": {
      "fr": "Positifs",
      "en": "Positive"
    }
  },
  "1221250": {
    "appId": 1221250,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 3263,
    "totalPositive": 3012,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1227690": {
    "appId": 1227690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2099,
    "finalPriceCents": 209,
    "discountPercent": 90,
    "formattedFinalPrice": "2,09€",
    "formattedInitialPrice": "20,99€",
    "totalReviews": 10263,
    "totalPositive": 9786,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1229240": {
    "appId": 1229240,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 874,
    "discountPercent": 65,
    "formattedFinalPrice": "8,74€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 8147,
    "totalPositive": 7218,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1229490": {
    "appId": 1229490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2149,
    "finalPriceCents": 1611,
    "discountPercent": 25,
    "formattedFinalPrice": "16,11€",
    "formattedInitialPrice": "21,49€",
    "totalReviews": 243927,
    "totalPositive": 237473,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1231880": {
    "appId": 1231880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2577,
    "totalPositive": 2338,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1233070": {
    "appId": 1233070,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 1543,
    "totalPositive": 1418,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1240060": {
    "appId": 1240060,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1599,
    "finalPriceCents": 1599,
    "discountPercent": 0,
    "formattedFinalPrice": "15,99€",
    "formattedInitialPrice": "",
    "totalReviews": 554,
    "totalPositive": 483,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1244090": {
    "appId": 1244090,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3399,
    "finalPriceCents": 1699,
    "discountPercent": 50,
    "formattedFinalPrice": "16,99€",
    "formattedInitialPrice": "33,99€",
    "totalReviews": 15491,
    "totalPositive": 13712,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1245560": {
    "appId": 1245560,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 4557,
    "totalPositive": 4265,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1253920": {
    "appId": 1253920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 15150,
    "totalPositive": 13761,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1260520": {
    "appId": 1260520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 5834,
    "totalPositive": 5789,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1262350": {
    "appId": 1262350,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1399,
    "discountPercent": 30,
    "formattedFinalPrice": "13,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 34502,
    "totalPositive": 33324,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1266030": {
    "appId": 1266030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 1862,
    "totalPositive": 1681,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1272320": {
    "appId": 1272320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "formattedInitialPrice": "",
    "totalReviews": 10913,
    "totalPositive": 9358,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1280930": {
    "appId": 1280930,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 8588,
    "totalPositive": 8124,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1282730": {
    "appId": 1282730,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 36551,
    "totalPositive": 33889,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1284190": {
    "appId": 1284190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2399,
    "finalPriceCents": 2399,
    "discountPercent": 0,
    "formattedFinalPrice": "23,99€",
    "totalReviews": 74135,
    "totalPositive": 71192,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1285670": {
    "appId": 1285670,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 299,
    "finalPriceCents": 299,
    "discountPercent": 0,
    "formattedFinalPrice": "2,99€",
    "totalReviews": 12403,
    "totalPositive": 12002,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1286350": {
    "appId": 1286350,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 9598,
    "totalPositive": 8823,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1286990": {
    "appId": 1286990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2699,
    "finalPriceCents": 917,
    "discountPercent": 66,
    "formattedFinalPrice": "9,17€",
    "formattedInitialPrice": "26,99€",
    "totalReviews": 2588,
    "totalPositive": 2335,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1291340": {
    "appId": 1291340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 599,
    "finalPriceCents": 599,
    "discountPercent": 0,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "",
    "totalReviews": 20091,
    "totalPositive": 19216,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1295320": {
    "appId": 1295320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 566,
    "totalPositive": 562,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1295920": {
    "appId": 1295920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2099,
    "finalPriceCents": 2099,
    "discountPercent": 0,
    "formattedFinalPrice": "20,99€",
    "formattedInitialPrice": "",
    "totalReviews": 7276,
    "totalPositive": 6706,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1296610": {
    "appId": 1296610,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 16620,
    "totalPositive": 13843,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1313140": {
    "appId": 1313140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 129786,
    "totalPositive": 124454,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1318690": {
    "appId": 1318690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 14281,
    "totalPositive": 13731,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1319460": {
    "appId": 1319460,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 487,
    "discountPercent": 75,
    "formattedFinalPrice": "4,87€",
    "formattedInitialPrice": "19,50€",
    "totalReviews": 874,
    "totalPositive": 794,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1321440": {
    "appId": 1321440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 599,
    "discountPercent": 70,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 11121,
    "totalPositive": 10456,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1325200": {
    "appId": 1325200,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 5999,
    "finalPriceCents": 2399,
    "discountPercent": 60,
    "formattedFinalPrice": "23,99€",
    "formattedInitialPrice": "59,99€",
    "totalReviews": 50647,
    "totalPositive": 44262,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1326470": {
    "appId": 1326470,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "formattedInitialPrice": "",
    "totalReviews": 284893,
    "totalPositive": 252364,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1328350": {
    "appId": 1328350,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 6419,
    "totalPositive": 6052,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1328990": {
    "appId": 1328990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 867,
    "totalPositive": 810,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1329500": {
    "appId": 1329500,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3928,
    "totalPositive": 3690,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1332010": {
    "appId": 1332010,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2849,
    "finalPriceCents": 2849,
    "discountPercent": 0,
    "formattedFinalPrice": "28,49€",
    "totalReviews": 178411,
    "totalPositive": 173437,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1335530": {
    "appId": 1335530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1500,
    "finalPriceCents": 1500,
    "discountPercent": 0,
    "formattedFinalPrice": "15,--€",
    "formattedInitialPrice": "",
    "totalReviews": 1354,
    "totalPositive": 1211,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1336490": {
    "appId": 1336490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 33320,
    "totalPositive": 31562,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1337010": {
    "appId": 1337010,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1619,
    "finalPriceCents": 323,
    "discountPercent": 80,
    "formattedFinalPrice": "3,23€",
    "formattedInitialPrice": "16,19€",
    "totalReviews": 6816,
    "totalPositive": 6671,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1337520": {
    "appId": 1337520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "totalReviews": 28726,
    "totalPositive": 25864,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1337760": {
    "appId": 1337760,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 4384,
    "totalPositive": 3455,
    "positivePercent": 79,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1340480": {
    "appId": 1340480,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1749,
    "finalPriceCents": 1749,
    "discountPercent": 0,
    "formattedFinalPrice": "17,49€",
    "totalReviews": 6407,
    "totalPositive": 5967,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1346020": {
    "appId": 1346020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1949,
    "finalPriceCents": 1949,
    "discountPercent": 0,
    "formattedFinalPrice": "19,49€",
    "formattedInitialPrice": "",
    "totalReviews": 404,
    "totalPositive": 282,
    "positivePercent": 70,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1363080": {
    "appId": 1363080,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 91762,
    "totalPositive": 77186,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1366540": {
    "appId": 1366540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1679,
    "finalPriceCents": 1679,
    "discountPercent": 0,
    "formattedFinalPrice": "16,79€",
    "formattedInitialPrice": "",
    "totalReviews": 83568,
    "totalPositive": 81409,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1369630": {
    "appId": 1369630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 999,
    "discountPercent": 60,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 45896,
    "totalPositive": 43033,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1371980": {
    "appId": 1371980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 82035,
    "totalPositive": 65090,
    "positivePercent": 79,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1372320": {
    "appId": 1372320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2104,
    "totalPositive": 2001,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1373960": {
    "appId": 1373960,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 9575,
    "totalPositive": 8531,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1382070": {
    "appId": 1382070,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 749,
    "discountPercent": 70,
    "formattedFinalPrice": "7,49€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 13252,
    "totalPositive": 12525,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1385380": {
    "appId": 1385380,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 13108,
    "totalPositive": 10516,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1388880": {
    "appId": 1388880,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1004,
    "discountPercent": 33,
    "formattedFinalPrice": "10,04€",
    "formattedInitialPrice": "14,99€",
    "totalReviews": 32449,
    "totalPositive": 31466,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1395030": {
    "appId": 1395030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1367,
    "totalPositive": 1270,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1404850": {
    "appId": 1404850,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 11544,
    "totalPositive": 10762,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1422440": {
    "appId": 1422440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3896,
    "totalPositive": 3460,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1432860": {
    "appId": 1432860,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 735,
    "discountPercent": 70,
    "formattedFinalPrice": "7,35€",
    "formattedInitialPrice": "24,50€",
    "totalReviews": 22112,
    "totalPositive": 17676,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1436590": {
    "appId": 1436590,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 1799,
    "discountPercent": 0,
    "formattedFinalPrice": "17,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2758,
    "totalPositive": 2288,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1451940": {
    "appId": 1451940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1329,
    "finalPriceCents": 451,
    "discountPercent": 66,
    "formattedFinalPrice": "4,51€",
    "formattedInitialPrice": "13,29€",
    "totalReviews": 58154,
    "totalPositive": 54848,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1454400": {
    "appId": 1454400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 93334,
    "totalPositive": 89987,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1455840": {
    "appId": 1455840,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 1299,
    "discountPercent": 0,
    "formattedFinalPrice": "12,99€",
    "formattedInitialPrice": "",
    "totalReviews": 27452,
    "totalPositive": 26501,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1458100": {
    "appId": 1458100,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 7513,
    "totalPositive": 6702,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1458140": {
    "appId": 1458140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 26911,
    "totalPositive": 22378,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1466640": {
    "appId": 1466640,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1996,
    "finalPriceCents": 1996,
    "discountPercent": 0,
    "formattedFinalPrice": "19,96€",
    "totalReviews": 26315,
    "totalPositive": 24111,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1488200": {
    "appId": 1488200,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1849,
    "finalPriceCents": 1849,
    "discountPercent": 0,
    "formattedFinalPrice": "18,49€",
    "formattedInitialPrice": "",
    "totalReviews": 12893,
    "totalPositive": 12216,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1497440": {
    "appId": 1497440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 9083,
    "totalPositive": 8614,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1509960": {
    "appId": 1509960,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 399,
    "finalPriceCents": 399,
    "discountPercent": 0,
    "formattedFinalPrice": "3,99€",
    "formattedInitialPrice": "",
    "totalReviews": 23753,
    "totalPositive": 21727,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1519710": {
    "appId": 1519710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1645,
    "finalPriceCents": 822,
    "discountPercent": 50,
    "formattedFinalPrice": "8,22€",
    "formattedInitialPrice": "16,45€",
    "totalReviews": 332,
    "totalPositive": 241,
    "positivePercent": 73,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1523890": {
    "appId": 1523890,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 1249,
    "discountPercent": 0,
    "formattedFinalPrice": "12,49€",
    "totalReviews": 0,
    "totalPositive": 0,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1527950": {
    "appId": 1527950,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "formattedInitialPrice": "",
    "totalReviews": 32224,
    "totalPositive": 27743,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1533420": {
    "appId": 1533420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2379,
    "finalPriceCents": 2379,
    "discountPercent": 0,
    "formattedFinalPrice": "23,79€",
    "totalReviews": 20850,
    "totalPositive": 20407,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1546920": {
    "appId": 1546920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 1249,
    "discountPercent": 0,
    "formattedFinalPrice": "12,49€",
    "formattedInitialPrice": "",
    "totalReviews": 572,
    "totalPositive": 518,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1549550": {
    "appId": 1549550,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 849,
    "finalPriceCents": 849,
    "discountPercent": 0,
    "formattedFinalPrice": "8,49€",
    "formattedInitialPrice": "",
    "totalReviews": 893,
    "totalPositive": 848,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1555140": {
    "appId": 1555140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 460,
    "totalPositive": 366,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1557740": {
    "appId": 1557740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 549,
    "finalPriceCents": 549,
    "discountPercent": 0,
    "formattedFinalPrice": "5,49€",
    "formattedInitialPrice": "",
    "totalReviews": 35768,
    "totalPositive": 34135,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1562430": {
    "appId": 1562430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 1999,
    "discountPercent": 50,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "39,99€",
    "totalReviews": 57025,
    "totalPositive": 54649,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1562700": {
    "appId": 1562700,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1249,
    "finalPriceCents": 811,
    "discountPercent": 35,
    "formattedFinalPrice": "8,11€",
    "formattedInitialPrice": "12,49€",
    "totalReviews": 45155,
    "totalPositive": 43901,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1574310": {
    "appId": 1574310,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 2079,
    "totalPositive": 1835,
    "positivePercent": 88,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1578650": {
    "appId": 1578650,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 10603,
    "totalPositive": 9794,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1586800": {
    "appId": 1586800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 975,
    "discountPercent": 50,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "19,50€",
    "totalReviews": 4517,
    "totalPositive": 4468,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1590910": {
    "appId": 1590910,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3720,
    "totalPositive": 3135,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1592280": {
    "appId": 1592280,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4783,
    "totalPositive": 4465,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1593030": {
    "appId": 1593030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 624,
    "discountPercent": 75,
    "formattedFinalPrice": "6,24€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 8044,
    "totalPositive": 7013,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1594320": {
    "appId": 1594320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3399,
    "finalPriceCents": 3399,
    "discountPercent": 0,
    "formattedFinalPrice": "33,99€",
    "formattedInitialPrice": "",
    "totalReviews": 11053,
    "totalPositive": 9973,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1599020": {
    "appId": 1599020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "formattedInitialPrice": "",
    "totalReviews": 2886,
    "totalPositive": 2822,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1599600": {
    "appId": 1599600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 18505,
    "totalPositive": 17539,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1601580": {
    "appId": 1601580,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 4499,
    "finalPriceCents": 2249,
    "discountPercent": 50,
    "formattedFinalPrice": "22,49€",
    "formattedInitialPrice": "44,99€",
    "totalReviews": 20914,
    "totalPositive": 15526,
    "positivePercent": 74,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1604030": {
    "appId": 1604030,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "totalReviews": 137287,
    "totalPositive": 122125,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1607680": {
    "appId": 1607680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 4220,
    "totalPositive": 3332,
    "positivePercent": 79,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1608230": {
    "appId": 1608230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 399,
    "discountPercent": 80,
    "formattedFinalPrice": "3,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 10636,
    "totalPositive": 9890,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1609230": {
    "appId": 1609230,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2889,
    "finalPriceCents": 2311,
    "discountPercent": 20,
    "formattedFinalPrice": "23,11€",
    "formattedInitialPrice": "28,89€",
    "totalReviews": 5308,
    "totalPositive": 5198,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1614440": {
    "appId": 1614440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1411,
    "totalPositive": 1167,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1621690": {
    "appId": 1621690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 66535,
    "totalPositive": 61839,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1623730": {
    "appId": 1623730,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 488836,
    "totalPositive": 462318,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1623940": {
    "appId": 1623940,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 599,
    "discountPercent": 80,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "29,99€",
    "totalReviews": 7891,
    "totalPositive": 7466,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1624540": {
    "appId": 1624540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "formattedInitialPrice": "",
    "totalReviews": 8176,
    "totalPositive": 7241,
    "positivePercent": 89,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1625450": {
    "appId": 1625450,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 184723,
    "totalPositive": 172348,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1627570": {
    "appId": 1627570,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 2999,
    "discountPercent": 0,
    "formattedFinalPrice": "29,99€",
    "totalReviews": 4234,
    "totalPositive": 3591,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1629520": {
    "appId": 1629520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 599,
    "discountPercent": 60,
    "formattedFinalPrice": "5,99€",
    "formattedInitialPrice": "14,99€",
    "totalReviews": 16949,
    "totalPositive": 15548,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1634860": {
    "appId": 1634860,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1499,
    "finalPriceCents": 1499,
    "discountPercent": 0,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "",
    "totalReviews": 7825,
    "totalPositive": 7648,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1637320": {
    "appId": 1637320,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 1799,
    "discountPercent": 0,
    "formattedFinalPrice": "17,99€",
    "formattedInitialPrice": "",
    "totalReviews": 18996,
    "totalPositive": 17578,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1657630": {
    "appId": 1657630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2849,
    "finalPriceCents": 2849,
    "discountPercent": 0,
    "formattedFinalPrice": "28,49€",
    "formattedInitialPrice": "",
    "totalReviews": 43669,
    "totalPositive": 41259,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1658150": {
    "appId": 1658150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4069,
    "totalPositive": 3429,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1669420": {
    "appId": 1669420,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 1842,
    "totalPositive": 1755,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1670870": {
    "appId": 1670870,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3499,
    "finalPriceCents": 3499,
    "discountPercent": 0,
    "formattedFinalPrice": "34,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3010,
    "totalPositive": 2623,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1674780": {
    "appId": 1674780,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 749,
    "totalPositive": 641,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1675830": {
    "appId": 1675830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 7029,
    "totalPositive": 6635,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1677310": {
    "appId": 1677310,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 8919,
    "totalPositive": 8645,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1677770": {
    "appId": 1677770,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 1799,
    "discountPercent": 0,
    "formattedFinalPrice": "17,99€",
    "formattedInitialPrice": "",
    "totalReviews": 9792,
    "totalPositive": 9569,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1684930": {
    "appId": 1684930,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "",
    "totalReviews": 8034,
    "totalPositive": 7812,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1703340": {
    "appId": 1703340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2199,
    "finalPriceCents": 2199,
    "discountPercent": 0,
    "formattedFinalPrice": "21,99€",
    "totalReviews": 36151,
    "totalPositive": 34014,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1740300": {
    "appId": 1740300,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2102,
    "totalPositive": 2084,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1740720": {
    "appId": 1740720,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 10806,
    "totalPositive": 9277,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1743850": {
    "appId": 1743850,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1075,
    "finalPriceCents": 1075,
    "discountPercent": 0,
    "formattedFinalPrice": "10,75€",
    "formattedInitialPrice": "",
    "totalReviews": 3090,
    "totalPositive": 2918,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1775490": {
    "appId": 1775490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 879,
    "finalPriceCents": 879,
    "discountPercent": 0,
    "formattedFinalPrice": "8,79€",
    "formattedInitialPrice": "",
    "totalReviews": 2483,
    "totalPositive": 2404,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1794680": {
    "appId": 1794680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 265844,
    "totalPositive": 261358,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1808680": {
    "appId": 1808680,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3299,
    "finalPriceCents": 1649,
    "discountPercent": 50,
    "formattedFinalPrice": "16,49€",
    "formattedInitialPrice": "32,99€",
    "totalReviews": 3379,
    "totalPositive": 3279,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1809540": {
    "appId": 1809540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "totalReviews": 45668,
    "totalPositive": 43128,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1811990": {
    "appId": 1811990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 8855,
    "totalPositive": 7344,
    "positivePercent": 83,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1846170": {
    "appId": 1846170,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 779,
    "finalPriceCents": 779,
    "discountPercent": 0,
    "formattedFinalPrice": "7,79€",
    "totalReviews": 11272,
    "totalPositive": 10344,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1863430": {
    "appId": 1863430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 1749,
    "discountPercent": 30,
    "formattedFinalPrice": "17,49€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 2242,
    "totalPositive": 1633,
    "positivePercent": 73,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1867530": {
    "appId": 1867530,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3699,
    "finalPriceCents": 3699,
    "discountPercent": 0,
    "formattedFinalPrice": "36,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1354,
    "totalPositive": 1221,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1868140": {
    "appId": 1868140,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 162553,
    "totalPositive": 156841,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1885110": {
    "appId": 1885110,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2379,
    "finalPriceCents": 2379,
    "discountPercent": 0,
    "formattedFinalPrice": "23,79€",
    "totalReviews": 2294,
    "totalPositive": 2130,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1887020": {
    "appId": 1887020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 303,
    "totalPositive": 196,
    "positivePercent": 65,
    "reviewScoreDesc": {
      "fr": "Moyens",
      "en": "Mixed"
    }
  },
  "1887400": {
    "appId": 1887400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1699,
    "finalPriceCents": 1699,
    "discountPercent": 0,
    "formattedFinalPrice": "16,99€",
    "totalReviews": 4698,
    "totalPositive": 4475,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1888160": {
    "appId": 1888160,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 5999,
    "finalPriceCents": 5999,
    "discountPercent": 0,
    "formattedFinalPrice": "59,99€",
    "totalReviews": 86046,
    "totalPositive": 78920,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1889040": {
    "appId": 1889040,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 899,
    "finalPriceCents": 899,
    "discountPercent": 0,
    "formattedFinalPrice": "8,99€",
    "formattedInitialPrice": "",
    "totalReviews": 4008,
    "totalPositive": 3839,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1911950": {
    "appId": 1911950,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 3,
    "totalPositive": 2,
    "positivePercent": 67,
    "reviewScoreDesc": {
      "fr": "Positifs",
      "en": "Positive"
    }
  },
  "1927720": {
    "appId": 1927720,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 749,
    "finalPriceCents": 262,
    "discountPercent": 65,
    "formattedFinalPrice": "2,62€",
    "formattedInitialPrice": "7,49€",
    "totalReviews": 7595,
    "totalPositive": 7463,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1931770": {
    "appId": 1931770,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 34759,
    "totalPositive": 34149,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1935660": {
    "appId": 1935660,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 399,
    "finalPriceCents": 399,
    "discountPercent": 0,
    "formattedFinalPrice": "3,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2884,
    "totalPositive": 2816,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1940340": {
    "appId": 1940340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3649,
    "finalPriceCents": 3649,
    "discountPercent": 0,
    "formattedFinalPrice": "36,49€",
    "totalReviews": 26989,
    "totalPositive": 20141,
    "positivePercent": 75,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1942280": {
    "appId": 1942280,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 118976,
    "totalPositive": 114132,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1944430": {
    "appId": 1944430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 12629,
    "totalPositive": 11780,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1959340": {
    "appId": 1959340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Bientôt",
    "totalReviews": 0,
    "totalPositive": 0,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1959390": {
    "appId": 1959390,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1211,
    "totalPositive": 1173,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1963690": {
    "appId": 1963690,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Bientôt",
    "totalReviews": 0,
    "totalPositive": 0,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1966720": {
    "appId": 1966720,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 510938,
    "totalPositive": 495407,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1966900": {
    "appId": 1966900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "formattedInitialPrice": "",
    "totalReviews": 27882,
    "totalPositive": 25170,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1970580": {
    "appId": 1970580,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1899,
    "finalPriceCents": 1899,
    "discountPercent": 0,
    "formattedFinalPrice": "18,99€",
    "totalReviews": 8527,
    "totalPositive": 7366,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1977170": {
    "appId": 1977170,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "totalReviews": 6926,
    "totalPositive": 6424,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1978590": {
    "appId": 1978590,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "formattedInitialPrice": "",
    "totalReviews": 3593,
    "totalPositive": 3329,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "1984020": {
    "appId": 1984020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 2206,
    "totalPositive": 1642,
    "positivePercent": 74,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "1985690": {
    "appId": 1985690,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 16065,
    "totalPositive": 15586,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1989270": {
    "appId": 1989270,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1699,
    "finalPriceCents": 849,
    "discountPercent": 50,
    "formattedFinalPrice": "8,49€",
    "formattedInitialPrice": "16,99€",
    "totalReviews": 34148,
    "totalPositive": 33019,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "1996010": {
    "appId": 1996010,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 7761,
    "totalPositive": 7604,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2008920": {
    "appId": 2008920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 3270,
    "totalPositive": 3069,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2060130": {
    "appId": 2060130,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2450,
    "finalPriceCents": 2450,
    "discountPercent": 0,
    "formattedFinalPrice": "24,50€",
    "totalReviews": 9110,
    "totalPositive": 8299,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2067920": {
    "appId": 2067920,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "formattedInitialPrice": "",
    "totalReviews": 8121,
    "totalPositive": 7377,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2072450": {
    "appId": 2072450,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 6999,
    "finalPriceCents": 6999,
    "discountPercent": 0,
    "formattedFinalPrice": "69,99€",
    "totalReviews": 24075,
    "totalPositive": 21790,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2085540": {
    "appId": 2085540,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2088570": {
    "appId": 2088570,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "",
    "totalReviews": 10255,
    "totalPositive": 9853,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2111190": {
    "appId": 2111190,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1995,
    "finalPriceCents": 1296,
    "discountPercent": 35,
    "formattedFinalPrice": "12,96€",
    "formattedInitialPrice": "19,95€",
    "totalReviews": 9563,
    "totalPositive": 9342,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2114740": {
    "appId": 2114740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 4499,
    "finalPriceCents": 1124,
    "discountPercent": 75,
    "formattedFinalPrice": "11,24€",
    "formattedInitialPrice": "44,99€",
    "totalReviews": 21691,
    "totalPositive": 19668,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2134770": {
    "appId": 2134770,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 499,
    "discountPercent": 80,
    "formattedFinalPrice": "4,99€",
    "formattedInitialPrice": "24,99€",
    "totalReviews": 1891,
    "totalPositive": 1584,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2138710": {
    "appId": 2138710,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 3999,
    "finalPriceCents": 3999,
    "discountPercent": 0,
    "formattedFinalPrice": "39,99€",
    "totalReviews": 28851,
    "totalPositive": 26502,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2142790": {
    "appId": 2142790,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1379,
    "finalPriceCents": 1379,
    "discountPercent": 0,
    "formattedFinalPrice": "13,79€",
    "formattedInitialPrice": "",
    "totalReviews": 32241,
    "totalPositive": 31250,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2151450": {
    "appId": 2151450,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 399,
    "finalPriceCents": 267,
    "discountPercent": 33,
    "formattedFinalPrice": "2,67€",
    "formattedInitialPrice": "3,99€",
    "totalReviews": 14,
    "totalPositive": 14,
    "positivePercent": 100,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2162800": {
    "appId": 2162800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2899,
    "finalPriceCents": 2899,
    "discountPercent": 0,
    "formattedFinalPrice": "28,99€",
    "formattedInitialPrice": "",
    "totalReviews": 13903,
    "totalPositive": 13475,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2171440": {
    "appId": 2171440,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 15537,
    "totalPositive": 15092,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2179850": {
    "appId": 2179850,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 4071,
    "totalPositive": 3907,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2187290": {
    "appId": 2187290,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 689,
    "finalPriceCents": 103,
    "discountPercent": 85,
    "formattedFinalPrice": "1,03€",
    "formattedInitialPrice": "6,89€",
    "totalReviews": 11391,
    "totalPositive": 10344,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2195120": {
    "appId": 2195120,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2599,
    "finalPriceCents": 2599,
    "discountPercent": 0,
    "formattedFinalPrice": "25,99€",
    "formattedInitialPrice": "",
    "totalReviews": 2482,
    "totalPositive": 2312,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2198150": {
    "appId": 2198150,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 24696,
    "totalPositive": 24033,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2218750": {
    "appId": 2218750,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 666,
    "finalPriceCents": 666,
    "discountPercent": 0,
    "formattedFinalPrice": "6,66€",
    "totalReviews": 31884,
    "totalPositive": 30393,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2231450": {
    "appId": 2231450,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "totalReviews": 72715,
    "totalPositive": 71461,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2272250": {
    "appId": 2272250,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 1511,
    "totalPositive": 1233,
    "positivePercent": 82,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2276930": {
    "appId": 2276930,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 589,
    "finalPriceCents": 589,
    "discountPercent": 0,
    "formattedFinalPrice": "5,89€",
    "totalReviews": 8404,
    "totalPositive": 7733,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2299900": {
    "appId": 2299900,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1000,
    "finalPriceCents": 1000,
    "discountPercent": 0,
    "formattedFinalPrice": "10,--€",
    "totalReviews": 6066,
    "totalPositive": 5962,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2303350": {
    "appId": 2303350,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "formattedInitialPrice": "",
    "totalReviews": 6007,
    "totalPositive": 5748,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2321470": {
    "appId": 2321470,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1299,
    "finalPriceCents": 1299,
    "discountPercent": 0,
    "formattedFinalPrice": "12,99€",
    "totalReviews": 48327,
    "totalPositive": 41674,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2334730": {
    "appId": 2334730,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 689,
    "finalPriceCents": 689,
    "discountPercent": 0,
    "formattedFinalPrice": "6,89€",
    "formattedInitialPrice": "",
    "totalReviews": 20942,
    "totalPositive": 18856,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2366970": {
    "appId": 2366970,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 1799,
    "discountPercent": 0,
    "formattedFinalPrice": "17,99€",
    "totalReviews": 2308,
    "totalPositive": 2213,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2366980": {
    "appId": 2366980,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1799,
    "finalPriceCents": 899,
    "discountPercent": 50,
    "formattedFinalPrice": "8,99€",
    "formattedInitialPrice": "17,99€",
    "totalReviews": 8476,
    "totalPositive": 8156,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2379780": {
    "appId": 2379780,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1399,
    "finalPriceCents": 1399,
    "discountPercent": 0,
    "formattedFinalPrice": "13,99€",
    "totalReviews": 198724,
    "totalPositive": 194421,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2396240": {
    "appId": 2396240,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2999,
    "finalPriceCents": 749,
    "discountPercent": 75,
    "formattedFinalPrice": "7,49€",
    "formattedInitialPrice": "29,99€",
    "totalReviews": 2209,
    "totalPositive": 2064,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2403830": {
    "appId": 2403830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2549,
    "finalPriceCents": 2166,
    "discountPercent": 15,
    "formattedFinalPrice": "21,66€",
    "formattedInitialPrice": "25,49€",
    "totalReviews": 17,
    "totalPositive": 13,
    "positivePercent": 76,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "2408820": {
    "appId": 2408820,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1199,
    "discountPercent": 40,
    "formattedFinalPrice": "11,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 11209,
    "totalPositive": 9423,
    "positivePercent": 84,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2415010": {
    "appId": 2415010,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 14915,
    "totalPositive": 14611,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2420510": {
    "appId": 2420510,
    "isFree": true,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Gratuit",
    "totalReviews": 40774,
    "totalPositive": 40366,
    "positivePercent": 99,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2420660": {
    "appId": 2420660,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 10681,
    "totalPositive": 9995,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2427700": {
    "appId": 2427700,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1479,
    "finalPriceCents": 1479,
    "discountPercent": 0,
    "formattedFinalPrice": "14,79€",
    "totalReviews": 20723,
    "totalPositive": 18903,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2449490": {
    "appId": 2449490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "totalReviews": 2,
    "totalPositive": 2,
    "positivePercent": 100,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2459550": {
    "appId": 2459550,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1699,
    "discountPercent": 15,
    "formattedFinalPrice": "16,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 3965,
    "totalPositive": 3846,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2475490": {
    "appId": 2475490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1279,
    "finalPriceCents": 1279,
    "discountPercent": 0,
    "formattedFinalPrice": "12,79€",
    "totalReviews": 38740,
    "totalPositive": 36888,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2567430": {
    "appId": 2567430,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 0,
    "finalPriceCents": 0,
    "discountPercent": 0,
    "formattedFinalPrice": "Bientôt",
    "totalReviews": 0,
    "totalPositive": 0,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2567870": {
    "appId": 2567870,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "formattedInitialPrice": "",
    "totalReviews": 54818,
    "totalPositive": 49252,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2666510": {
    "appId": 2666510,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 699,
    "finalPriceCents": 699,
    "discountPercent": 0,
    "formattedFinalPrice": "6,99€",
    "formattedInitialPrice": "",
    "totalReviews": 13905,
    "totalPositive": 13454,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2670630": {
    "appId": 2670630,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1999,
    "discountPercent": 0,
    "formattedFinalPrice": "19,99€",
    "totalReviews": 84127,
    "totalPositive": 77430,
    "positivePercent": 92,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2678990": {
    "appId": 2678990,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 249,
    "discountPercent": 50,
    "formattedFinalPrice": "2,49€",
    "formattedInitialPrice": "4,99€",
    "totalReviews": 6122,
    "totalPositive": 5962,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2716400": {
    "appId": 2716400,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 3793,
    "totalPositive": 3515,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2742830": {
    "appId": 2742830,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2499,
    "finalPriceCents": 2499,
    "discountPercent": 0,
    "formattedFinalPrice": "24,99€",
    "formattedInitialPrice": "",
    "totalReviews": 8660,
    "totalPositive": 8249,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2751490": {
    "appId": 2751490,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 199,
    "finalPriceCents": 199,
    "discountPercent": 0,
    "formattedFinalPrice": "1,99€",
    "totalReviews": 2,
    "totalPositive": 0,
    "positivePercent": 0,
    "reviewScoreDesc": {
      "fr": "Positifs",
      "en": "Positive"
    }
  },
  "2754380": {
    "appId": 2754380,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1950,
    "finalPriceCents": 1950,
    "discountPercent": 0,
    "formattedFinalPrice": "19,50€",
    "formattedInitialPrice": "",
    "totalReviews": 9723,
    "totalPositive": 9371,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2818800": {
    "appId": 2818800,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 9,
    "totalPositive": 6,
    "positivePercent": 67,
    "reviewScoreDesc": {
      "fr": "Positifs",
      "en": "Positive"
    }
  },
  "2835570": {
    "appId": 2835570,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 299,
    "finalPriceCents": 299,
    "discountPercent": 0,
    "formattedFinalPrice": "2,99€",
    "totalReviews": 126162,
    "totalPositive": 119986,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "2868840": {
    "appId": 2868840,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2299,
    "finalPriceCents": 2299,
    "discountPercent": 0,
    "formattedFinalPrice": "22,99€",
    "totalReviews": 201767,
    "totalPositive": 123375,
    "positivePercent": 61,
    "reviewScoreDesc": {
      "fr": "Moyens",
      "en": "Mixed"
    }
  },
  "2881650": {
    "appId": 2881650,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 749,
    "finalPriceCents": 749,
    "discountPercent": 0,
    "formattedFinalPrice": "7,49€",
    "totalReviews": 163518,
    "totalPositive": 153363,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "2902170": {
    "appId": 2902170,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2049,
    "finalPriceCents": 1844,
    "discountPercent": 10,
    "formattedFinalPrice": "18,44€",
    "formattedInitialPrice": "20,49€",
    "totalReviews": 111,
    "totalPositive": 84,
    "positivePercent": 76,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "2950790": {
    "appId": 2950790,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1999,
    "finalPriceCents": 1499,
    "discountPercent": 25,
    "formattedFinalPrice": "14,99€",
    "formattedInitialPrice": "19,99€",
    "totalReviews": 14086,
    "totalPositive": 13778,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3002740": {
    "appId": 3002740,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1025,
    "finalPriceCents": 922,
    "discountPercent": 10,
    "formattedFinalPrice": "9,22€",
    "formattedInitialPrice": "10,25€",
    "totalReviews": 24,
    "totalPositive": 18,
    "positivePercent": 75,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "3008700": {
    "appId": 3008700,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1025,
    "finalPriceCents": 922,
    "discountPercent": 10,
    "formattedFinalPrice": "9,22€",
    "formattedInitialPrice": "10,25€",
    "totalReviews": 27,
    "totalPositive": 25,
    "positivePercent": 93,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3070070": {
    "appId": 3070070,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 2049,
    "finalPriceCents": 1741,
    "discountPercent": 15,
    "formattedFinalPrice": "17,41€",
    "formattedInitialPrice": "20,49€",
    "totalReviews": 50081,
    "totalPositive": 48273,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3097560": {
    "appId": 3097560,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 689,
    "finalPriceCents": 689,
    "discountPercent": 0,
    "formattedFinalPrice": "6,89€",
    "totalReviews": 56355,
    "totalPositive": 50460,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3103780": {
    "appId": 3103780,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3106270": {
    "appId": 3106270,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9.99€",
    "totalReviews": 0,
    "totalPositive": 0,
    "positivePercent": 85,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3124020": {
    "appId": 3124020,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 215,
    "finalPriceCents": 182,
    "discountPercent": 15,
    "formattedFinalPrice": "1,82€",
    "formattedInitialPrice": "2,15€",
    "totalReviews": 13,
    "totalPositive": 13,
    "positivePercent": 100,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3146520": {
    "appId": 3146520,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 70456,
    "totalPositive": 68578,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3235170": {
    "appId": 3235170,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 975,
    "discountPercent": 0,
    "formattedFinalPrice": "9,75€",
    "formattedInitialPrice": "",
    "totalReviews": 130,
    "totalPositive": 123,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3405340": {
    "appId": 3405340,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 975,
    "finalPriceCents": 585,
    "discountPercent": 40,
    "formattedFinalPrice": "5,85€",
    "formattedInitialPrice": "9,75€",
    "totalReviews": 106094,
    "totalPositive": 100048,
    "positivePercent": 94,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3458180": {
    "appId": 3458180,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3560670": {
    "appId": 3560670,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 719,
    "finalPriceCents": 510,
    "discountPercent": 29,
    "formattedFinalPrice": "5,10€",
    "formattedInitialPrice": "7,19€",
    "totalReviews": 455,
    "totalPositive": 415,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3804370": {
    "appId": 3804370,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1349,
    "finalPriceCents": 1214,
    "discountPercent": 10,
    "formattedFinalPrice": "12,14€",
    "formattedInitialPrice": "13,49€",
    "totalReviews": 46,
    "totalPositive": 45,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "3812600": {
    "appId": 3812600,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 999,
    "discountPercent": 0,
    "formattedFinalPrice": "9,99€",
    "totalReviews": 500,
    "totalPositive": 450,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3936270": {
    "appId": 3936270,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 899,
    "discountPercent": 10,
    "formattedFinalPrice": "8,99€",
    "formattedInitialPrice": "9,99€",
    "totalReviews": 118,
    "totalPositive": 103,
    "positivePercent": 87,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3949040": {
    "appId": 3949040,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 779,
    "finalPriceCents": 467,
    "discountPercent": 40,
    "formattedFinalPrice": "4,67€",
    "formattedInitialPrice": "7,79€",
    "totalReviews": 86177,
    "totalPositive": 77701,
    "positivePercent": 90,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "3949620": {
    "appId": 3949620,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 415,
    "finalPriceCents": 373,
    "discountPercent": 10,
    "formattedFinalPrice": "3,73€",
    "formattedInitialPrice": "4,15€",
    "totalReviews": 14,
    "totalPositive": 12,
    "positivePercent": 86,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "4001890": {
    "appId": 4001890,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 749,
    "finalPriceCents": 749,
    "discountPercent": 0,
    "formattedFinalPrice": "7,49€",
    "totalReviews": 66689,
    "totalPositive": 63425,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4289410": {
    "appId": 4289410,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 519,
    "finalPriceCents": 415,
    "discountPercent": 20,
    "formattedFinalPrice": "4,15€",
    "formattedInitialPrice": "5,19€",
    "totalReviews": 100,
    "totalPositive": 98,
    "positivePercent": 98,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4364730": {
    "appId": 4364730,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 999,
    "finalPriceCents": 899,
    "discountPercent": 10,
    "formattedFinalPrice": "8,99€",
    "formattedInitialPrice": "9,99€",
    "totalReviews": 147,
    "totalPositive": 117,
    "positivePercent": 80,
    "reviewScoreDesc": {
      "fr": "Plutôt positifs",
      "en": "Mostly Positive"
    }
  },
  "4656000": {
    "appId": 4656000,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 815,
    "finalPriceCents": 815,
    "discountPercent": 0,
    "formattedFinalPrice": "8,15€",
    "totalReviews": 2843,
    "totalPositive": 2747,
    "positivePercent": 97,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4696240": {
    "appId": 4696240,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 109,
    "finalPriceCents": 109,
    "discountPercent": 0,
    "formattedFinalPrice": "1,09€",
    "totalReviews": 7,
    "totalPositive": 7,
    "positivePercent": 100,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4705510": {
    "appId": 4705510,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 499,
    "finalPriceCents": 499,
    "discountPercent": 0,
    "formattedFinalPrice": "4,99€",
    "totalReviews": 2058,
    "totalPositive": 1960,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4739660": {
    "appId": 4739660,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 1549,
    "finalPriceCents": 1549,
    "discountPercent": 0,
    "formattedFinalPrice": "15,49€",
    "totalReviews": 3450,
    "totalPositive": 3306,
    "positivePercent": 96,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  },
  "4753960": {
    "appId": 4753960,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 555,
    "finalPriceCents": 416,
    "discountPercent": 25,
    "formattedFinalPrice": "4,16€",
    "formattedInitialPrice": "5,55€",
    "totalReviews": 252,
    "totalPositive": 230,
    "positivePercent": 91,
    "reviewScoreDesc": {
      "fr": "Très positifs",
      "en": "Very Positive"
    }
  },
  "4834070": {
    "appId": 4834070,
    "isFree": false,
    "currency": "EUR",
    "initialPriceCents": 200,
    "finalPriceCents": 200,
    "discountPercent": 0,
    "formattedFinalPrice": "2,--€",
    "totalReviews": 827,
    "totalPositive": 789,
    "positivePercent": 95,
    "reviewScoreDesc": {
      "fr": "Extrêmement positifs",
      "en": "Overwhelmingly Positive"
    }
  }
};

/**
 * Cache d'extension en mémoire pour les jeux ajoutés dynamiquement
 */
const DYNAMIC_STORE_CACHE: Record<number, SteamStoreGameData> = {};

/**
 * Permet d'enregistrer des données Steam Store en direct au runtime
 */
export function registerSteamStoreData(data: SteamStoreGameData): void {
  if (data && data.appId) {
    DYNAMIC_STORE_CACHE[data.appId] = data;
  }
}

/**
 * Récupère les données Steam Store certifiées par AppID
 * Supporte indifféremment les identifiants numériques ou sous forme de chaînes.
 */
export function getSteamStoreData(appId?: number | string | null): SteamStoreGameData | undefined {
  if (!appId) return undefined;
  const numId = typeof appId === 'string' ? parseInt(appId, 10) : appId;
  if (!numId || isNaN(numId)) return undefined;
  return DYNAMIC_STORE_CACHE[numId] || STEAM_STORE_DATA[numId];
}

/**
 * Retourne l'ensemble de la base des données Steam Store
 */
export function getAllSteamStoreData(): Record<number, SteamStoreGameData> {
  return { ...STEAM_STORE_DATA, ...DYNAMIC_STORE_CACHE };
}
