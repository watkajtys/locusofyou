export interface OnboardingStep {
  id: string;
  type: 'messages' | 'choice_question' | 'slider' | 'text_input' | 'transition';
  title?: string;
  messages?: Array<{
    text: string;
    delay?: number;
  }>;
  question?: {
    text: string;
    icon?: string;
  };
  choices?: Array<{
    id: string;
    text: string;
    icon: string;
    value: any;
  }>;
  slider?: {
    questionText: string;
    leftLabel: string;
    rightLabel: string;
    icon: string;
    field: string;
  };
  textInput?: {
    placeholder: string;
    field: string;
    submitButtonText: string;
  };
  transition?: {
    message: string;
    delay?: number;
  };
  field?: string; // Which field in onboardingData to update
  nextStep?: string;
  autoProgress?: boolean;
  autoProgressDelay?: number;
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
  initialData: {
    coachingStyle: string;
    conscientiousness: string | null;
    regulatoryFocus: string | null;
    locusOfControl: string | null;
    mindset: string | null;
    extraversion: number;
    agreeableness: number;
    currentFocus: string;
  };
}

export function GET(request: Request): Response {
  const config: OnboardingConfig = {
    steps: [
      {
        id: 'welcome_messages',
        type: 'messages',
        messages: [
          { text: 'Welcome.', delay: 0 },
          { text: "I'm here to be a supportive partner, at your pace. No pressure.", delay: 1200 },
          { text: 'To get started, I have one quick question to understand your style.', delay: 3000 }
        ],
        nextStep: 'conscientiousness_question',
        autoProgress: true,
        autoProgressDelay: 4200
      },
      {
        id: 'conscientiousness_question',
        type: 'choice_question',
        question: {
          text: "When you're at your best, are you more of a meticulous planner who loves a detailed roadmap, or a flexible adapter who thrives on creative problem-solving?",
          icon: 'compass'
        },
        choices: [
          {
            id: 'planner',
            text: 'Meticulous Planner',
            icon: 'map',
            value: 'planner'
          },
          {
            id: 'adapter',
            text: 'Flexible Adapter',
            icon: 'wand',
            value: 'adapter'
          }
        ],
        field: 'conscientiousness',
        nextStep: 'transition_to_regulatory'
      },
      {
        id: 'transition_to_regulatory',
        type: 'transition',
        transition: {
          message: "Got it. That's helpful. A few more quick questions to get a clearer picture of your style. Just choose the one that feels closer to your truth.",
          delay: 0
        },
        nextStep: 'regulatory_focus_question',
        autoProgress: true,
        autoProgressDelay: 1000
      },
      {
        id: 'regulatory_focus_question',
        type: 'choice_question',
        question: {
          text: "Thinking about what drives you towards a goal, does it feel more like you're striving to achieve a positive outcome, or more like you're working hard to prevent a negative one?",
          icon: 'target'
        },
        choices: [
          {
            id: 'promotion',
            text: 'Striving to achieve a positive outcome',
            icon: 'star',
            value: 'promotion'
          },
          {
            id: 'prevention',
            text: 'Working hard to prevent a negative one',
            icon: 'shield',
            value: 'prevention'
          }
        ],
        field: 'regulatoryFocus',
        nextStep: 'transition_to_locus'
      },
      {
        id: 'transition_to_locus',
        type: 'transition',
        transition: {
          message: 'Okay, next...',
          delay: 0
        },
        nextStep: 'locus_of_control_question',
        autoProgress: true,
        autoProgressDelay: 800
      },
      {
        id: 'locus_of_control_question',
        type: 'choice_question',
        question: {
          text: 'When you achieve a major success, do you tend to credit it more to your disciplined preparation and hard work, or to being in the right place at the right time?',
          icon: 'brain'
        },
        choices: [
          {
            id: 'internal',
            text: 'Disciplined preparation and hard work',
            icon: 'brain',
            value: 'internal'
          },
          {
            id: 'external',
            text: 'Being in the right place at the right time',
            icon: 'gift',
            value: 'external'
          }
        ],
        field: 'locusOfControl',
        nextStep: 'transition_to_mindset'
      },
      {
        id: 'transition_to_mindset',
        type: 'transition',
        transition: {
          message: 'Last one like this...',
          delay: 0
        },
        nextStep: 'mindset_question',
        autoProgress: true,
        autoProgressDelay: 800
      },
      {
        id: 'mindset_question',
        type: 'choice_question',
        question: {
          text: "Do you feel that a person's ability to stay focused and organized is something they're mostly born with, or is it a skill that can be developed over time with the right strategies?",
          icon: 'lightbulb'
        },
        choices: [
          {
            id: 'fixed',
            text: 'Mostly born with it',
            icon: 'lock',
            value: 'fixed'
          },
          {
            id: 'growth',
            text: 'A skill that can be developed',
            icon: 'leaf',
            value: 'growth'
          }
        ],
        field: 'mindset',
        nextStep: 'transition_to_sliders'
      },
      {
        id: 'transition_to_sliders',
        type: 'transition',
        transition: {
          message: "Thanks for that. Now for a couple of questions on a different note. For these, just slide to the point on the scale that feels most like you.",
          delay: 0
        },
        nextStep: 'extraversion_slider',
        autoProgress: true,
        autoProgressDelay: 1200
      },
      {
        id: 'extraversion_slider',
        type: 'slider',
        slider: {
          questionText: 'When it comes to tackling a big project, where do you draw your energy from?',
          leftLabel: 'Working quietly on my own',
          rightLabel: 'Bouncing ideas off of a group',
          icon: 'lightbulb',
          field: 'extraversion'
        },
        field: 'extraversion',
        nextStep: 'transition_to_agreeableness'
      },
      {
        id: 'transition_to_agreeableness',
        type: 'transition',
        transition: {
          message: 'Got it. One more like that...',
          delay: 0
        },
        nextStep: 'agreeableness_slider',
        autoProgress: true,
        autoProgressDelay: 800
      },
      {
        id: 'agreeableness_slider',
        type: 'slider',
        slider: {
          questionText: "When someone gives you critical feedback on your work, what's your initial instinct?",
          leftLabel: 'Challenge the feedback and defend my position',
          rightLabel: 'Find common ground and seek to understand their view',
          icon: 'target',
          field: 'agreeableness'
        },
        field: 'agreeableness',
        nextStep: 'final_input'
      },
      {
        id: 'final_input',
        type: 'messages',
        messages: [
          { text: 'Perfect. That gives me a complete picture of your unique style.', delay: 0 },
          { text: "Now, let's bring the focus to you.", delay: 1200 },
          { text: "What's on your mind right now that feels most important?", delay: 2400 }
        ],
        nextStep: 'text_input_step',
        autoProgress: true,
        autoProgressDelay: 3600
      },
      {
        id: 'text_input_step',
        type: 'text_input',
        textInput: {
          placeholder: "Share what's most important to you right now...",
          field: 'currentFocus',
          submitButtonText: 'Begin Coaching'
        },
        field: 'currentFocus'
      }
    ],
    initialData: {
      coachingStyle: '',
      conscientiousness: null,
      regulatoryFocus: null,
      locusOfControl: null,
      mindset: null,
      extraversion: 50,
      agreeableness: 50,
      currentFocus: ''
    }
  };

  return Response.json(config);
}