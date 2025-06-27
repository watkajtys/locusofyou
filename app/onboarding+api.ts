export function GET(request: Request) {
  const onboardingData = {
    framing: {
      headline: "The first AI coach that understands *why* you're stuck.",
      subHeadline: "LocusOfYou is a new type of AI coach. We use proven psychology to diagnose the root of procrastination and inaction, helping you build lasting motivation and reclaim your personal agency.",
      trustPillars: [
        {
          icon: "microscope",
          text: "Powered by Science"
        },
        {
          icon: "heart", 
          text: "Guided by Empathy"
        },
        {
          icon: "shield",
          text: "Designed for Trust & Safety"
        }
      ],
      buttonText: "Begin Discovery"
    },
    steps: [
      {
        id: "initialMessages",
        type: "messages",
        messages: [
          { text: "Welcome.", delay: 0 },
          { text: "I'm here to be a supportive partner, at your pace. No pressure.", delay: 1200 },
          { text: "To get started, I have one quick question to understand your style.", delay: 3000 }
        ],
        nextStep: "conscientiousnessQuestion"
      },
      {
        id: "conscientiousnessQuestion",
        type: "cardChoice",
        question: "When you're at your best, are you more of a meticulous planner who loves a detailed roadmap, or a flexible adapter who thrives on creative problem-solving?",
        choices: [
          {
            id: "planner",
            text: "Meticulous Planner",
            icon: "map",
            value: "planner"
          },
          {
            id: "adapter", 
            text: "Flexible Adapter",
            icon: "wand",
            value: "adapter"
          }
        ],
        field: "conscientiousness",
        nextStep: "transitionToRegulatory",
        previousStep: "initialMessages"
      },
      {
        id: "transitionToRegulatory",
        type: "transitionMessage",
        message: "Got it. That's helpful. A few more quick questions to get a clearer picture of your style. Just choose the one that feels closer to your truth.",
        nextStep: "regulatoryFocusQuestion",
        previousStep: "conscientiousnessQuestion"
      },
      {
        id: "regulatoryFocusQuestion",
        type: "cardChoice",
        question: "Thinking about what drives you towards a goal, does it feel more like you're striving to achieve a positive outcome, or more like you're working hard to prevent a negative one?",
        choices: [
          {
            id: "promotion",
            text: "Striving to achieve a positive outcome",
            icon: "star",
            value: "promotion"
          },
          {
            id: "prevention",
            text: "Working hard to prevent a negative one", 
            icon: "shield",
            value: "prevention"
          }
        ],
        field: "regulatoryFocus",
        nextStep: "transitionToLocus",
        previousStep: "transitionToRegulatory"
      },
      {
        id: "transitionToLocus",
        type: "transitionMessage",
        message: "Okay, next...",
        nextStep: "locusOfControlQuestion",
        previousStep: "regulatoryFocusQuestion"
      },
      {
        id: "locusOfControlQuestion",
        type: "cardChoice",
        question: "When you achieve a major success, do you tend to credit it more to your disciplined preparation and hard work, or to being in the right place at the right time?",
        choices: [
          {
            id: "internal",
            text: "Disciplined preparation and hard work",
            icon: "brain",
            value: "internal"
          },
          {
            id: "external",
            text: "Being in the right place at the right time",
            icon: "gift", 
            value: "external"
          }
        ],
        field: "locusOfControl",
        nextStep: "transitionToMindset",
        previousStep: "transitionToLocus"
      },
      {
        id: "transitionToMindset",
        type: "transitionMessage", 
        message: "Last one like this...",
        nextStep: "mindsetQuestion",
        previousStep: "locusOfControlQuestion"
      },
      {
        id: "mindsetQuestion",
        type: "cardChoice",
        question: "Do you feel that a person's ability to stay focused and organized is something they're mostly born with, or is it a skill that can be developed over time with the right strategies?",
        choices: [
          {
            id: "fixed",
            text: "Mostly born with it",
            icon: "lock",
            value: "fixed"
          },
          {
            id: "growth",
            text: "A skill that can be developed",
            icon: "leaf",
            value: "growth"
          }
        ],
        field: "mindset",
        nextStep: "transitionToSliders",
        previousStep: "transitionToMindset"
      },
      {
        id: "transitionToSliders",
        type: "transitionMessage",
        message: "Thanks for that. Now for a couple of questions on a different note. For these, just slide to the point on the scale that feels most like you.",
        nextStep: "extraversionSlider",
        previousStep: "mindsetQuestion"
      },
      {
        id: "extraversionSlider",
        type: "slider",
        question: "When it comes to tackling a big project, where do you draw your energy from?",
        leftLabel: "Working quietly on my own",
        rightLabel: "Bouncing ideas off of a group",
        field: "extraversion",
        icon: "lightbulb",
        nextStep: "transitionToAgreeableness",
        previousStep: "transitionToSliders"
      },
      {
        id: "transitionToAgreeableness",
        type: "transitionMessage",
        message: "Got it. One more like that...",
        nextStep: "agreeablenessSlider", 
        previousStep: "extraversionSlider"
      },
      {
        id: "agreeablenessSlider",
        type: "slider",
        question: "When someone gives you critical feedback on your work, what's your initial instinct?",
        leftLabel: "Challenge the feedback and defend my position",
        rightLabel: "Find common ground and seek to understand their view",
        field: "agreeableness",
        icon: "target",
        nextStep: "finalMessagesAndInput",
        previousStep: "transitionToAgreeableness"
      },
      {
        id: "finalMessagesAndInput",
        type: "finalInput",
        messages: [
          { text: "Perfect. That gives me a complete picture of your unique style.", delay: 0 },
          { text: "Now, let's bring the focus to you.", delay: 1200 },
          { text: "What's on your mind right now that feels most important?", delay: 2400 }
        ],
        inputPlaceholder: "Share what's most important to you right now...",
        submitButtonText: "Begin Coaching",
        field: "currentFocus",
        previousStep: "agreeablenessSlider"
      }
    ]
  };

  return Response.json(onboardingData);
}