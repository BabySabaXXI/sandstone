/**
 * Sandstone Economics AI Intelligence Engine
 * Powered by Pearson Edexcel IAL Economics Training Data
 * 
 * This module contains comprehensive case studies, exam techniques,
 * and subject knowledge extracted from official training materials.
 */

// ============================================================================
// CASE STUDIES DATABASE - Extracted from Training Data
// ============================================================================

export const caseStudies = {
  // Unit 1: Markets in Action - Market Failures
  marketFailures: {
    zeroEmissionZones: {
      title: "UK Zero Emission Zones (2024-2025)",
      context: "UK towns implementing ZEZs to tackle air pollution causing 28,000-36,000 premature deaths annually and $6 trillion global economic losses.",
      economicConcepts: ["Negative externalities", "MPC < MSC", "Deadweight loss", "Tax incidence"],
      diagram: "MSC above MPC with tax shifting MPC up to MSC",
      evaluation: {
        pros: ["Corrects market failure", "Encourages innovation", "Dynamic efficiency gains", "Revenue for government"],
        cons: ["Regressive impact on low-income", "Effectiveness depends on PED", "May cause traffic diversion", "Administrative costs"]
      },
      application: "Oxford and London ZEZ implementation",
      statistics: "28,000-36,000 premature deaths annually in UK from air pollution"
    },
    housingMarket: {
      title: "UK Housing Market Failure (2024-2025)",
      context: "Multiple market failures leading to undersupply, high prices, and affordability crises.",
      marketFailureTypes: ["Information asymmetry", "Market power (oligopoly)", "Externalities", "Merit good arguments"],
      statistics: {
        rentAsIncome: "34% (2009) → 40% (2024)",
        profitPerHouse: "£29,000 (2007) → £57,000 (2018)",
        top11BuildersMarketShare: "40%",
        top5ProfitsRise: "388% (2012-2016)"
      },
      policies: {
        supplySide: ["Public investment in social housing", "Land reform", "Support for SME builders", "Planning system reform"],
        demandSide: ["Help to Buy schemes", "Stamp duty changes", "First-time buyer incentives"]
      }
    },
    carbonPricing: {
      title: "Carbon Pricing and Emissions Trading (UK)",
      instruments: {
        ukETS: { started: "April 2001", participants: 34, achievement: "4.62 MtCO2e abatement vs 0.79 target" },
        climateChangeLevy: { description: "Tax on fossil fuel use", discount: "90% electricity, 65% other fuels with CCA" },
        carbonPriceSupport: { introduced: 2013, result: "26% decline in power-sector emissions (2013-2015)" }
      },
      evaluation: {
        successes: ["Significant emissions reductions", "Cost-effective abatement", "Established carbon trading infrastructure"],
        limitations: ["Waterbed effect within EU ETS", "Carbon leakage", "Price volatility"]
      }
    }
  },

  // Unit 3: Business Behaviour
  marketStructures: {
    chinaEV: {
      title: "China's Electric Vehicle Price Wars (2024-2025)",
      structure: "Oligopoly with initial contestability",
      statistics: {
        manufacturers: "120+ Chinese EV makers",
        foreignShareChange: "60% (2020) → 30% (2024)",
        nioLoss: "$1.7bn in H1 2025"
      },
      analysis: {
        barriers: ["Technology", "Capital", "Economies of scale", "R&D costs"],
        behavior: "Sacrificing short-term profitability for market share",
        expectedOutcome: "100 of 120 firms may close, increasing concentration"
      },
      efficiency: {
        dynamic: "Rapid innovation",
        allocative: "Prices below cost (temporary)",
        productive: "Economies of scale eventually"
      }
    },
    ukHousebuilding: {
      title: "UK Housebuilding Industry - Oligopoly Analysis",
      concentration: {
        historical: "1960: Top 10 = 9%",
        current: "Top 11 firms = ~40%",
        barrattShare: "8% alone (2021-22)"
      },
      barriersToEntry: ["Planning permission difficulties", "Land banking by incumbents", "Access to finance", "Economies of scale in purchasing"],
      profitGrowth: {
        completions: "+22% p.a. (2012-2016)",
        top5Profits: "+388% (same period)",
        profitPerHouse: "£29,000 (2007) → £57,000 (2018)"
      },
      implications: "Evidence of market power, restricted supply maintaining prices, supernormal profits in long run"
    },
    ukSupermarkets: {
      title: "UK Supermarket Price Wars",
      structure: "Oligopoly with competitive fringe",
      players: {
        dominant: ["Tesco", "Sainsbury's", "Asda", "Morrisons"],
        growing: ["Aldi", "Lidl"],
        discountGrowth: "5% → 15%+ market share"
      },
      competition: {
        nonPrice: ["Loyalty schemes", "Product ranges", "Online delivery", "Store experience"],
        price: ["Aldi price matching", "Everyday low prices", "Promotional pricing"]
      }
    }
  },

  // Unit 2: Macroeconomic Performance
  macroeconomicPolicies: {
    ukSlowdown2025: {
      title: "UK Economic Growth Slowdown (Q2 2025)",
      statistics: {
        gdpGrowth: "0.3% (down from 0.7% Q1)",
        yearOnYear: "+1.2%",
        businessInvestment: "-4.0%",
        governmentSpending: "+1.2%",
        tradeDeficit: "£9.2bn"
      },
      causes: ["Fall in business investment", "Trade deterioration", "End of temporary boost"],
      policyImplications: {
        monetary: "Bank Rate at 5.25%, case for further reductions",
        fiscal: "Government spending supporting growth but higher taxes counterproductive",
        supplySide: "Business investment incentives needed"
      }
    },
    ukInflation2024: {
      title: "UK Inflation and Monetary Policy (2024-2025)",
      trajectory: {
        oct2024: "2.3%",
        oct2025: "3.6%",
        target: "2.0%"
      },
      indicators: {
        wageGrowth: "Real pay growth down to 0.7%",
        unemployment: "4.3% → 5.0%",
        payrollFall: "117,000 employees"
      },
      tradeOffs: {
        cutRates: ["Stimulate growth", "Support employment", "Boost investment", "Risk inflation rise"],
        keepHigh: ["Control inflation", "Anchor expectations", "Maintain credibility", "Risk recession"]
      }
    },
    nationalMinimumWage: {
      title: "National Minimum Wage Policy (2024-2025)",
      rates: {
        nlw: "£11.44/hour (21+)",
        age21_22: "£11.44 (from £10.18)",
        age18_20: "£8.60",
        age16_17: "£6.40"
      },
      history: {
        introduced: "1999 at £3.60/hour",
        realGrowth: "1.7% p.a. (1999-2015) → 3.2% p.a. (2015-2024)",
        target: "Two-thirds of median earnings"
      },
      impact: {
        coverage: "1.91 million jobs",
        beneficiaries: "Poorest 70% of households",
        regional: "33% London vs 51% North of England",
        fiscal: "Net improvement £25.1bn"
      }
    }
  },

  // Unit 4: Global Economy
  developmentEconomics: {
    indonesia: {
      title: "Indonesia - Commodity Dependence (2000-2024)",
      structure: "4th largest coal exporter (11% of exports)",
      commodityCollapse: {
        coalPrice: "$125/tonne (2011) → $50/tonne (current)",
        overallValue: "-50% from peak",
        growthImpact: "6% (2004-2014) → 4.8% (2015)",
        currency: "Rupiah -30% vs USD since 2013"
      },
      structuralChallenges: ["Labour market inflexibility", "47 days to start business", "Need for diversification"]
    },
    rwanda: {
      title: "Rwanda - Development Success Story (2001-2018)",
      achievements: {
        childMortality: "2/3 reduction",
        education: "Near-universal primary enrolment",
        poverty: "59% → 39% (2001-2014)",
        inequality: "Gini 0.52 → 0.43"
      },
      strategies: {
        humanDevelopment: ["Health system investment", "Education expansion", "Poverty reduction programs"],
        economic: ["Industrialisation push", "Business environment reform", "Aid effectiveness"]
      },
      successFactors: ["Effective governance", "Aid coordination", "Focus on human capital", "Stable political environment"]
    },
    developmentInnovations: {
      barefootCollege: { country: "India", description: "Rural solar electrification, training local women as engineers" },
      touristTax: { country: "Bhutan", description: "$200 daily tourist fee, sustainable tourism model" },
      mobileBanking: { country: "Kenya (M-Pesa)", description: "96% household usage, financial inclusion" },
      cashTransfers: { country: "Brazil (Bolsa Família)", description: "Reduced poverty by 27%" }
    }
  }
};

// ============================================================================
// EXAM TECHNIQUES AND MARK SCHEME GUIDANCE
// ============================================================================

export const examTechniques = {
  // Assessment Objectives breakdown
  assessmentObjectives: {
    AO1: {
      name: "Knowledge & Understanding",
      weight: 25,
      requirements: [
        "Accurate definitions of key terms",
        "Correct economic terminology throughout",
        "Relevant concepts and theories identified",
        "Formulas stated correctly where relevant"
      ],
      commonErrors: [
        "Vague definitions without key components",
        "Confusing similar concepts (e.g., shift vs movement along curve)",
        "Missing key formulas (PED, YED, etc.)"
      ]
    },
    AO2: {
      name: "Application",
      weight: 25,
      requirements: [
        "Use real-world examples and case studies",
        "Apply knowledge to specific context provided",
        "Reference current economic events (2024-2025)",
        "Use data from extracts where provided"
      ],
      commonErrors: [
        "Generic examples without specific context",
        "Outdated examples (pre-2020)",
        "Ignoring provided extracts"
      ]
    },
    AO3: {
      name: "Analysis",
      weight: 25,
      requirements: [
        "Clear chains of reasoning (minimum 3 steps)",
        "Use appropriate diagrams accurately",
        "Explain causal relationships",
        "Develop arguments logically"
      ],
      commonErrors: [
        "Assertion without explanation",
        "Diagrams without explanation or labels",
        "Broken chains of reasoning"
      ]
    },
    AO4: {
      name: "Evaluation",
      weight: 25,
      requirements: [
        "Balanced consideration of both sides",
        "Use evaluative language (depends on, however, although)",
        "Prioritize arguments in conclusion",
        "Provide reasoned judgment"
      ],
      commonErrors: [
        "List of pros/cons without analysis",
        "Generic evaluation (always/never)",
        "Weak conclusion without judgment"
      ]
    }
  },

  // Question type specific guidance
  questionTypes: {
    "4-mark": {
      structure: "2 knowledge points + 2 application points",
      timeGuide: "5 minutes",
      advice: "Define key terms clearly. Apply immediately to context.",
      level3: "Precise definitions + specific application to context",
      level2: "Good definitions + some application",
      level1: "Basic definitions, limited application"
    },
    "6-mark": {
      structure: "Knowledge + Application with development (2-3 points)",
      timeGuide: "8 minutes",
      advice: "Provide developed points, not just lists",
      level3: "3 developed points with clear application",
      level2: "2 developed points",
      level1: "Undeveloped list of points"
    },
    "8-mark": {
      structure: "Knowledge + Application + Analysis",
      timeGuide: "12 minutes",
      advice: "Include chains of reasoning. Use diagrams where appropriate.",
      level3: "Clear analysis with chains of reasoning, accurate diagram",
      level2: "Some analysis, limited chains",
      level1: "Descriptive, no real analysis"
    },
    "10-mark": {
      structure: "4 marks analysis + 6 marks evaluation",
      timeGuide: "15 minutes",
      advice: "Balance between analysis and evaluation. Minimum 2 evaluative points.",
      analysisLevels: {
        L2: "2 clear analytical points with development",
        L1: "Limited analysis"
      },
      evaluationLevels: {
        L3: "Developed evaluation with priorities/reasoned judgment",
        L2: "2 evaluative points",
        L1: "Simple evaluative statements"
      }
    },
    "12-mark": {
      structure: "Knowledge + Application + Extended Analysis",
      timeGuide: "18 minutes",
      advice: "Develop chains thoroughly. Use real-world examples.",
      level3: "Detailed analysis with thorough development",
      level2: "Clear but limited analysis",
      level1: "Undeveloped description"
    },
    "14-mark": {
      structure: "6 marks analysis + 8 marks evaluation",
      timeGuide: "22 minutes",
      advice: "L2 evaluation requires 2+ evaluative points. L3 requires developed evaluation.",
      analysisLevels: {
        L2: "2 developed analytical points",
        L1: "Limited or descriptive"
      },
      evaluationLevels: {
        L3: "Developed evaluation with reasoned judgment",
        L2: "2+ evaluative points",
        L1: "Simple identification of pros/cons"
      }
    },
    "16-mark": {
      structure: "8 marks analysis + 8 marks evaluation",
      timeGuide: "25 minutes",
      advice: "Use context throughout. Evaluation must be balanced and developed.",
      analysisLevels: {
        L2: "Clear analysis with development and context",
        L1: "Limited analysis"
      },
      evaluationLevels: {
        L3: "Thorough evaluation with priorities in conclusion",
        L2: "Clear evaluation with some development",
        L1: "Undeveloped evaluation"
      }
    },
    "20-mark": {
      structure: "10 marks analysis + 10 marks evaluation with context",
      timeGuide: "35 minutes",
      advice: "Integrate extracts throughout. Provide reasoned judgment in conclusion.",
      analysisLevels: {
        L3: "Detailed analysis integrated with context",
        L2: "Clear analysis with some context",
        L1: "Limited analysis"
      },
      evaluationLevels: {
        L3: "Thorough evaluation with synoptic links and reasoned judgment",
        L2: "Clear evaluation with some development",
        L1: "Undeveloped evaluation"
      }
    }
  }
};

// ============================================================================
// DIAGRAM REQUIREMENTS BY TOPIC
// ============================================================================

export const diagramRequirements = {
  unit1: {
    marketEquilibrium: { required: ["Supply and demand curves", "Equilibrium price/quantity"], commonErrors: ["Wrong axis labels", "Confusing shifts with movements"] },
    elasticity: { required: ["Steep/flat demand curves", "Price and quantity changes shown"], commonErrors: ["Not showing price/quantity changes", "Wrong elasticity type"] },
    negativeExternalities: { required: ["MSC above MPC", "Deadweight loss triangle", "Optimal vs market quantity"], commonErrors: ["Wrong vertical distance", "Missing welfare loss"] },
    positiveExternalities: { required: ["MSB above MPB", "Underproduction shown"], commonErrors: ["Confusing with negative externalities"] },
    taxIncidence: { required: ["Original and new supply curves", "Consumer/producer burden shown"], commonErrors: ["Wrong burden allocation", "Not showing price changes"] },
    subsidy: { required: ["Shift in supply/demand", "Cost to government shown"], commonErrors: ["Wrong direction of shift"] }
  },
  unit2: {
    adAs: { required: ["AD, SRAS, LRAS curves", "Equilibrium output/price level"], commonErrors: ["Confusing SRAS and LRAS shapes"] },
    phillipsCurve: { required: ["Short-run downward slope", "Long-run vertical"], commonErrors: ["Wrong shape for LRPC"] },
    multiplier: { required: ["Initial and final AD shifts", "Size difference shown"], commonErrors: ["Not showing multiple rounds"] },
    crowdingOut: { required: ["Initial AD increase", "Subsequent decrease from higher interest rates"], commonErrors: ["Not showing the decrease"] }
  },
  unit3: {
    costCurves: { required: ["MC, AC, AVC curves", "Relationship between them shown"], commonErrors: ["MC not cutting AC at minimum", "Wrong shapes"] },
    revenueCurves: { required: ["TR, AR, MR curves", "Slope relationships correct"], commonErrors: ["TR not reaching max where MR=0"] },
    profitMaximization: { required: ["MC=MR point", "AC and AR for supernormal profit"], commonErrors: ["Wrong profit maximization point", "Not showing profit rectangle"] },
    perfectCompetition: { required: ["Horizontal demand curve", "MC=MR in equilibrium"], commonErrors: ["Downward sloping demand in SR"] },
    monopoly: { required: ["Downward sloping AR/MR", "Deadweight loss", "Supernormal profit"], commonErrors: ["Missing deadweight loss", "Wrong MR curve"] },
    kinkedDemand: { required: ["Kink in demand curve", "Discontinuous MR"], commonErrors: ["No gap in MR curve", "Wrong elasticity assumptions"] }
  },
  unit4: {
    comparativeAdvantage: { required: ["PPCs for two countries", "Gains from trade shown"], commonErrors: ["Not showing different opportunity costs"] },
    tariff: { required: ["Domestic and world supply", "Welfare loss triangles"], commonErrors: ["Missing consumer/producer surplus changes"] },
    exchangeRate: { required: ["Supply and demand for currency"], commonErrors: ["Wrong axis labels (price of what in what)"] }
  }
};

// ============================================================================
// EVALUATION PHRASES AND TECHNIQUES
// ============================================================================

export const evaluationFrameworks = {
  timeDimension: {
    shortRun: "In the short run, firms/consumers may not be able to adjust...",
    longRun: "However, in the long run, adjustments occur as...",
    veryLongRun: "In the very long run, structural changes mean..."
  },
  stakeholderAnalysis: {
    consumers: "Consumers benefit from lower prices but may face reduced choice...",
    producers: "Producers gain market share but face increased competitive pressure...",
    government: "The government gains revenue but faces implementation costs...",
    society: "Society benefits from corrected externalities but bears administrative costs..."
  },
  effectivenessFactors: {
    magnitude: "The effectiveness depends on the magnitude of the intervention...",
    timeLags: "There may be significant time lags before effects are visible...",
    otherFactors: "Other factors such as... may be more significant",
    dataLimitations: "Data limitations make it difficult to assess..."
  },
  prioritization: {
    mostSignificant: "The most significant factor is... because...",
    dependsOnContext: "It depends on the specific context; in cases of X, Y is more important, but when Z, W dominates...",
    weightOfEvidence: "On balance, the weight of evidence suggests..."
  }
};

// ============================================================================
// SYNOPTIC LINKS BY UNIT
// ============================================================================

export const synopticLinks = {
  unit1to2: ["Consumer behavior affects aggregate demand", "Externalities impact macroeconomic objectives", "Market power affects inflation"],
  unit1to3: ["Market structures determine price-setting behavior", "Barriers to entry affect competition intensity"],
  unit1to4: ["Trade affects market contestability", "Globalization changes market structures"],
  unit2to3: ["Macroeconomic conditions affect business investment", "Exchange rates affect import costs for firms"],
  unit2to4: ["Balance of payments constraints on macro policy", "Development affects global demand patterns"],
  unit3to4: ["Multinationals operate across markets", "Global supply chains affect firm costs"]
};

// ============================================================================
// GRADING ENGINE PROMPT CONSTRUCTOR
// ============================================================================

export function constructGradingPrompt(
  unit: string,
  questionType: string,
  examinerAO: string,
  hasDiagram: boolean
): string {
  const ao = examTechniques.assessmentObjectives[examinerAO as keyof typeof examTechniques.assessmentObjectives];
  const qt = examTechniques.questionTypes[questionType as keyof typeof examTechniques.questionTypes];
  
  return `You are an expert Pearson Edexcel IAL Economics examiner specializing in ${ao.name}.

**QUESTION TYPE:** ${questionType} (${qt?.timeGuide || "N/A"})
**UNIT:** ${unit}
${hasDiagram ? "**DIAGRAM INCLUDED:** Yes - assess accuracy and relevance" : "**DIAGRAM MISSING:** Deduct marks if required for this question type"}

**YOUR ASSESSMENT OBJECTIVE (${examinerAO} - ${ao.weight}%):**
${ao.requirements.map(r => `- ${r}`).join("\n")}

**COMMON ERRORS TO WATCH FOR:**
${ao.commonErrors.map(e => `- ${e}`).join("\n")}

**CASE STUDIES AVAILABLE FOR REFERENCE:**
${Object.values(caseStudies).map(category => 
  Object.values(category).map((cs: any) => `- ${cs.title}`).join("\n")
).join("\n")}

**MARKING GUIDANCE:**
${qt?.advice || "Provide detailed feedback"}

**DIAGRAM POLICY:**
${hasDiagram 
  ? "Student provided a diagram. Assess if it's accurate, labeled, and referenced in text." 
  : `No diagram provided. For ${questionType} questions, diagrams are ${questionType === "8-mark" || questionType === "14-mark" || questionType === "20-mark" ? "EXPECTED - deduct marks for missing/incorrect diagrams" : "optional but beneficial"}.`
}

Respond in JSON format with: score, feedback, strengths, improvements, annotations`;
}
