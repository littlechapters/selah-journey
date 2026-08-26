export type Pattern = { id: string; label: string; cost: string; gift: string };

export type Note = { text: string; source: string; url?: string; caveat: string };

export type Verse = {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  excerpt?: boolean;
};

export type StationKind = "read" | "patterns" | "write" | "sort" | "letter" | "scripture" | "mirror" | "carry";

export type Station = {
  id: string;
  kind: StationKind;
  kicker: string;
  title: string;
  body?: string;
  reading?: string;
  note?: string;
  prompt?: string;
  placeholder?: string;
  openings?: string[];
  buckets?: { id: string; label: string }[];
  notes?: Note[];
  scripture?: Verse;
  scriptures?: Verse[];
};

export type Path = {
  id: string;
  kicker: string;
  title: string;
  about: string;
  shape: string;
  patterns: Pattern[];
  stations: Station[];
};

const CARRY: Pattern[] = [
  {
    id: "sorry",
    label: "I apologise when nothing is wrong",
    cost: "You take the blame before anyone has offered it, and people start to believe you.",
    gift: "You notice the room. Very few people can feel a mood change as fast as you can.",
  },
  {
    id: "quiet",
    label: "I go quiet when I am hurt",
    cost: "The people who love you are left guessing, and guessing wrong.",
    gift: "You do not say the thing that cannot be taken back. That is a rarer discipline than it looks.",
  },
  {
    id: "alone",
    label: "I would rather do it myself than ask",
    cost: "You carry things that were never meant to be carried alone, and you are tired.",
    gift: "You are genuinely capable. People rely on you because you have earned it.",
  },
  {
    id: "peace",
    label: "I keep the peace even when it costs me",
    cost: "The peace is real for everyone but you.",
    gift: "You can hold a room together. Households have survived on people like you.",
  },
  {
    id: "loud",
    label: "I get loud before I get honest",
    cost: "The volume arrives before the meaning, so the meaning gets missed.",
    gift: "You do not go numb. Something in you still refuses to accept what is wrong.",
  },
  {
    id: "responsible",
    label: "I am the responsible one, always",
    cost: "Nobody thinks to ask how you are, because you have never once shown them they should.",
    gift: "You are the reason several things did not fall apart. You may never be told that.",
  },
  {
    id: "trouble",
    label: "I assume I am about to be in trouble",
    cost: "You brace for a blow that mostly is not coming, and bracing is exhausting.",
    gift: "You prepare. You are almost never caught out.",
  },
  {
    id: "cared",
    label: "I find it hard to be looked after",
    cost: "You keep people at the distance you can manage, and then feel the distance.",
    gift: "You give easily and without keeping score. That is not nothing.",
  },
  {
    id: "joke",
    label: "I make a joke when it gets close",
    cost: "The moment passes, and the thing you almost said goes back down.",
    gift: "You can make a heavy room breathe. People feel better near you and cannot say why.",
  },
  {
    id: "worst",
    label: "I plan for the worst so it cannot surprise me",
    cost: "You live through the bad version once in advance, whether or not it ever arrives.",
    gift: "When it does arrive, you are the one who already knows what to do.",
  },
];

const ENOUGH: Pattern[] = [
  {
    id: "finish-line",
    label: "I move the finish line as soon as I reach it",
    cost: "You never actually arrive. The moment you land, the ground moves, and the win belongs to nobody.",
    gift: "You are hard to satisfy, and it is part of why your work is good. Most people stop long before you do.",
  },
  {
    id: "compliment",
    label: "I cannot take a compliment",
    cost: "You wave away the one thing that might have fed you, and eventually people stop offering it.",
    gift: "You are not living off applause. Praise does not steer you the way it steers other people.",
  },
  {
    id: "resting-work",
    label: "I work when I am meant to be resting",
    cost: "Nothing gets all of you. Not the work, and not the evening.",
    gift: "When something matters you do not put it down. People have been carried by that and never knew.",
  },
  {
    id: "compare",
    label: "I measure myself against whoever is doing better",
    cost: "You pick the one person ahead of you and hand them your whole day.",
    gift: "You can recognise something excellent when it is in front of you. Plenty of people cannot.",
  },
  {
    id: "apologise-rest",
    label: "I apologise for resting",
    cost: "Even the break costs you something, so the tiredness never fully goes.",
    gift: "You feel your responsibilities rather than shrugging at them. That is rarer than it sounds.",
  },
  {
    id: "behind",
    label: "I feel behind and I cannot say behind what",
    cost: "You are running a race with no finish line and no other runners, and somehow still losing it.",
    gift: "Something in you refuses to drift. You have a sense of what your life could be.",
  },
  {
    id: "harsh",
    label: "I talk to myself more harshly than I would talk to anyone I love",
    cost: "The voice you live with is one you would never use on a friend.",
    gift: "You hold a high line. It is why the work is careful.",
  },
  {
    id: "prove",
    label: "I need to prove I deserve to be here",
    cost: "The proving never ends, because the jury never sits down.",
    gift: "You do not take a seat for granted. That has kept you honest.",
  },
];

const VERSION: Pattern[] = [
  {
    id: "perform",
    label: "I become who the room needs",
    cost: "You leave the room and cannot remember which one of you stayed.",
    gift: "You can read a room faster than most people can enter it.",
  },
  {
    id: "edit",
    label: "I edit the story before I tell it",
    cost: "The true version never gets said, so nobody can meet it.",
    gift: "You know the weight of words. You do not spend them carelessly.",
  },
  {
    id: "fine",
    label: "I say I am fine before anyone has asked",
    cost: "The people who would have helped are sent home at the door.",
    gift: "You do not make your pain other people’s homework.",
  },
  {
    id: "mirror-them",
    label: "I match whoever I am with",
    cost: "You are very good company and very hard to find.",
    gift: "People feel met by you. That is a real gift.",
  },
  {
    id: "hide-mess",
    label: "I hide the mess until it is presentable",
    cost: "Help arrives after the worst of it, if it arrives at all.",
    gift: "You have a sense of dignity. You will not make a spectacle of what hurts.",
  },
  {
    id: "almost",
    label: "I let people close, almost",
    cost: "Intimacy stops one room short of the one you actually live in.",
    gift: "You know what it costs to be known. You do not offer that lightly.",
  },
  {
    id: "image",
    label: "I keep a version of myself that cannot fail in public",
    cost: "The real one does all the failing in private, alone.",
    gift: "You can hold a standard when a room needs one.",
  },
  {
    id: "agree",
    label: "I agree out loud and disagree later, alone",
    cost: "Your actual mind never gets a seat at the table.",
    gift: "You do not start fires you cannot put out.",
  },
];

const ANGER: Pattern[] = [
  {
    id: "snap",
    label: "I snap at the people who are safest",
    cost: "The ones who stayed get the version nobody else is allowed to see.",
    gift: "With them, the guard comes down. That is not nothing.",
  },
  {
    id: "replay",
    label: "I replay the conversation until I win it",
    cost: "The day is spent twice, and the second time nobody is there.",
    gift: "You take what was said seriously. You do not shrug off a wound.",
  },
  {
    id: "shut",
    label: "I shut the door rather than say I am angry",
    cost: "The anger goes into the walls, and the house feels it anyway.",
    gift: "You would rather go quiet than say the thing that cannot come back.",
  },
  {
    id: "right",
    label: "I need to be right before I can be soft",
    cost: "Softness is held hostage until the case is closed.",
    gift: "You care about what is true. That is a form of love.",
  },
  {
    id: "body",
    label: "I feel it in my chest before I have a word for it",
    cost: "The word arrives late, after someone has already been hurt.",
    gift: "Your body tells the truth faster than your manners do.",
  },
  {
    id: "protect",
    label: "I get angry when someone I love is dismissed",
    cost: "The room meets the heat and misses the loyalty underneath it.",
    gift: "You will not stand by. People have been defended by that.",
  },
  {
    id: "small",
    label: "I go small, then I go sharp",
    cost: "Nobody sees the small part. They only meet the edge.",
    gift: "You tried to make yourself less first. That is not cruelty. That is a hope.",
  },
  {
    id: "old",
    label: "I am angry about something older than this afternoon",
    cost: "Today’s person is paying a bill they did not write.",
    gift: "You have not forgotten what was unjust. Forgetting is not the same as peace.",
  },
];

const WALK_SHAPE = "Ten short stops. Leave whenever you like. Come back to the same place.";

export const PATHS: Path[] = [
  {
    id: "what-you-carry",
    kicker: "Path one",
    title: "What you carry",
    about: "Some of it you chose. A lot of it was handed to you before you could decide anything.",
    shape: WALK_SHAPE,
    patterns: CARRY,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "This is not a test",
        body: "Nothing here is scored and nothing is added up. You can skip any question and the path still works. Everything you write stays on this device — Selah has nowhere to send it.",
        reading: "You are not here to be fixed. You are here to look at something honestly, with Someone who already sees it.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these sound like you?",
        body: "Not the worst of you. Just the ordinary, automatic things — the ones you do before you have decided to.",
        note: "Tap as many or as few as you like. Nothing is counted, and you can change them any time.",
      },
      {
        id: "where",
        kind: "write",
        kicker: "Trace it",
        title: "Where did you learn it?",
        body: "Pick one of the ones you tapped. Not the biggest — just one you can see clearly.",
        prompt: "Who did you first see doing this, or when did doing it keep you safe?",
        placeholder: "In my house, being quiet was…",
      },
      {
        id: "handed-down",
        kind: "scripture",
        kicker: "Why it travels",
        title: "You learned it before anyone taught you",
        body: "Two things are true here, and it helps to have both.",
        notes: [
          {
            text: "Children copy what they see, and they keep it even when they are not using it. In one study, children who watched an adult be told off for something copied it less — until someone gave them a reason to. Then they did it just as well as everybody else. They had known how the whole time.",
            source: "Bandura A. Influence of models’ reinforcement contingencies on the acquisition of imitative responses. Journal of Personality and Social Psychology 1(6), 589–595, 1965",
            url: "https://doi.org/10.1037/h0022070",
            caveat: "Nursery-age children in a laboratory, copying an adult minutes later. It shows that watching teaches. It does not show that childhood decides an adult.",
          },
        ],
        scripture: {
          text: "You shall not bow down to them or worship them; for I, the LORD your God, am a jealous God, visiting the iniquity of the fathers on their children to the third and fourth generations of those who hate Me,",
          reference: "Exodus 20:5 · BSB",
          book: "EXO",
          chapter: 20,
          verse: 5,
        },
        reading: "Naming that something was handed to you is not blaming anyone. It is telling the truth about where it came from.",
      },
      {
        id: "not-a-sentence",
        kind: "scripture",
        kicker: "And also this",
        title: "It is not a sentence",
        body: "Ezekiel is answering people who were quoting a proverb at him — that the parents ate sour grapes and the children's teeth were set on edge. He will not have it.",
        scripture: {
          text: "The soul who sins is the one who will die. A son will not bear the iniquity of his father, and a father will not bear the iniquity of his son.",
          reference: "Ezekiel 18:20 · BSB",
          book: "EZK",
          chapter: 18,
          verse: 20,
          excerpt: true,
        },
        reading: "What you were handed is real. It is not your verdict.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these still earn their keep?",
        body: "Here are the ones you tapped. Some protected you once and have outstayed their welcome. Put each one where it belongs today.",
        buckets: [
          { id: "keep", label: "Still mine" },
          { id: "was", label: "Kept me safe once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
        note: "There is no right answer, and nothing here is final.",
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter you will not send",
        body: "To whoever you learned it from. They will never read this — that is the point. You can be unfair. You can also be kind. Both are allowed.",
        prompt: "Dear",
        openings: [
          "I know you were doing your best, and",
          "I have never said this to you, but",
          "Something you did stayed with me.",
          "I am not angry any more. I used to be.",
          "Thank you for",
          "I wish you had",
        ],
      },
      {
        id: "formed",
        kind: "scripture",
        kicker: "Underneath all of it",
        title: "Someone was there first",
        body: "Before anything was handed to you, something else was already true.",
        scriptures: [
          {
            text: "For You formed my inmost being; You knit me together in my mother’s womb.",
            reference: "Psalm 139:13 · BSB",
            book: "PSA",
            chapter: 139,
            verse: 13,
          },
          {
            text: "The LORD is near to the brokenhearted; He saves the contrite in spirit.",
            reference: "Psalm 34:18 · BSB",
            book: "PSA",
            chapter: 34,
            verse: 18,
          },
        ],
        reading: "Whatever your house taught you about yourself, it was not the first thing said about you.",
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what you are carrying",
        body: "Everything you tapped, with both of its faces. The left is what it takes from you. The right is what it was doing for you.",
        reading: "You do not have to put any of it down today. Seeing both hands at once is enough for one walk.",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        body: "Not all of it. One. You can change it whenever you like, and nothing follows up with you about it.",
        note: "Whichever you choose, Selah will show you what it is for rather than what it costs.",
        scripture: {
          text: "being confident of this, that He who began a good work in you will carry it on to completion until the day of Christ Jesus.",
          reference: "Philippians 1:6 · BSB",
          book: "PHP",
          chapter: 1,
          verse: 6,
        },
        reading: "You are not being asked to fix it. Only to keep it where you can see it.",
      },
    ],
  },
  {
    id: "never-enough",
    kicker: "Path two",
    title: "Never enough",
    about: "The tiredness of earning your place: where the line is, who keeps moving it, and what was never for sale.",
    shape: WALK_SHAPE,
    patterns: ENOUGH,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Nothing here is being marked",
        body: "There is no finish line in this one. Nothing is counted. You can skip any part of it and the walk still works.",
        reading: "You do not have to arrive at anything today. You are allowed to simply look at how hard you have been working.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these do you recognise?",
        body: "Not the worst day. The ordinary machinery.",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "enough",
        kind: "write",
        kicker: "Trace it",
        title: "What would be enough?",
        prompt: "If the line stopped moving, what would you finally let yourself have?",
        placeholder: "I think I would…",
      },
      {
        id: "moving-line",
        kind: "scripture",
        kicker: "Why the line moves",
        title: "The finish line is a feeling, not a place",
        body: "When the worth of a day is staked on doing well, a success does not settle you. It raises the bar for the next one. The relief is brief because the standard moved with you.",
        notes: [
          {
            text: "When a person stakes their worth on achievement, doing well does not quiet them for long. The next pass mark is simply higher. Kindness toward yourself, by contrast, is associated with trying again after a failure rather than freezing.",
            source: "Crocker J, Knight KM. Contingencies of self-worth. Current Directions in Psychological Science 14(4), 200–203, 2005",
            url: "https://doi.org/10.1111/j.0963-7214.2005.00364.x",
            caveat: "This is a review of how people stake self-worth on domains like achievement. It does not name what is wrong with anyone, and it is not a method. Caring about your work is not the same as this pattern.",
          },
        ],
        scripture: {
          text: "In vain you rise early and stay up late, toiling for bread to eat— for He gives sleep to His beloved.",
          reference: "Psalm 127:2 · BSB",
          book: "PSA",
          chapter: 127,
          verse: 2,
        },
        reading: "The place was given. It was never a wage.",
      },
      {
        id: "grace",
        kind: "scripture",
        kicker: "It was never a wage",
        title: "It was never a wage",
        body: "The work did not purchase this. It never could.",
        scripture: {
          text: "For it is by grace you have been saved through faith, and this not from yourselves; it is the gift of God, not by works, so that no one can boast.",
          reference: "Ephesians 2:8–9 · BSB",
          book: "EPH",
          chapter: 2,
          verse: 8,
          verseEnd: 9,
        },
        notes: [
          {
            text: "People who treat themselves with ordinary kindness tend to try again after they fail, rather than freeze. That is not the same as thinking they are wonderful.",
            source: "Neff KD. Self-compassion, self-esteem, and well-being. Social and Personality Psychology Compass 5(1), 1–12, 2011",
            url: "https://doi.org/10.1111/j.1751-9004.2010.00330.x",
            caveat: "Most of this literature is self-report and cross-sectional. Kindness to yourself is associated with trying again. It is not a method, and it is not a verdict on anyone who finds it hard.",
          },
        ],
        reading: "The place was given. It was not earned, which means it cannot be lost by missing a line you drew yourself.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these still earn their keep?",
        buckets: [
          { id: "keep", label: "Still mine" },
          { id: "was", label: "Kept me moving" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter to whoever you are trying to satisfy",
        openings: [
          "I have been working for you for a long time.",
          "I do not know if you would even notice.",
          "I am tired of proving this.",
          "I wanted you to see me.",
        ],
      },
      {
        id: "rest",
        kind: "scripture",
        kicker: "Underneath",
        title: "He already knows what you are made of",
        scriptures: [
          {
            text: "Come to Me, all you who are weary and burdened, and I will give you rest.",
            reference: "Matthew 11:28 · BSB",
            book: "MAT",
            chapter: 11,
            verse: 28,
          },
          {
            text: "For He knows our frame; He is mindful that we are dust.",
            reference: "Psalm 103:14 · BSB",
            book: "PSA",
            chapter: 103,
            verse: 14,
          },
        ],
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what has been keeping you moving",
        reading: "You do not have to put any of it down today.",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "Come to Me, all you who are weary and burdened, and I will give you rest.",
          reference: "Matthew 11:28 · BSB",
          book: "MAT",
          chapter: 11,
          verse: 28,
        },
      },
    ],
  },
  {
    id: "good-version",
    kicker: "Path three",
    title: "The good version",
    about: "The gap between who they see and who you know you are — and the God who already knows both.",
    shape: WALK_SHAPE,
    patterns: VERSION,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Everybody does this",
        body: "A public self is not a lie by itself. It becomes a problem when it is the only self that is allowed to exist.",
        reading: "You are not on trial for having a face you show the room.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these do you recognise?",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "where",
        kind: "write",
        kicker: "Trace it",
        title: "Which room do you adjust in?",
        prompt: "Where does the good version take over?",
        placeholder: "At work, I become…",
      },
      {
        id: "audience",
        kind: "read",
        kicker: "Why it happens",
        title: "The face you show the room",
        body: "Most people keep a version of themselves for the room. That is not automatically a lie. It becomes a problem when it is the only version that is allowed to exist.",
        notes: [
          {
            text: "People manage what others see of them — they edit, they time it, they keep some things back. The finding is ordinary, not a verdict on anyone who does it.",
            source: "Leary MR, Kowalski RM. Impression management: a literature review and two-component model. Psychological Bulletin 107(1), 34–47, 1990",
            url: "https://doi.org/10.1037/0033-2909.107.1.34",
            caveat: "This is a review of how people present themselves in social life. It does not say anyone is false, and it cannot measure a person from a screen.",
          },
        ],
        reading: "A public self is not the crime. A private self with nowhere to go is the cost.",
      },
      {
        id: "known",
        kind: "scripture",
        kicker: "Already known",
        title: "Already known, and still here",
        scripture: {
          text: "O LORD, You have searched me and known me.",
          reference: "Psalm 139:1 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 1,
          excerpt: true,
        },
        reading: "The version you hide is not hidden from Him. He stayed.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these is simply privacy?",
        buckets: [
          { id: "keep", label: "Just privacy" },
          { id: "was", label: "Kept me safe once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter to the good version",
        openings: [
          "You have worked very hard.",
          "I built you because",
          "I am tired of being you in every room.",
          "Thank you for getting me through.",
        ],
      },
      {
        id: "formed",
        kind: "scripture",
        kicker: "Underneath",
        title: "Someone was there first",
        body: "Before the good version learned its lines, something else was already true.",
        scripture: {
          text: "For You formed my inmost being; You knit me together in my mother’s womb.",
          reference: "Psalm 139:13 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 13,
        },
        reading: "The version you hide is not hidden from Him. He stayed.",
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what you have been carrying",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "O LORD, You have searched me and known me.",
          reference: "Psalm 139:1 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 1,
          excerpt: true,
        },
      },
    ],
  },
  {
    id: "under-the-anger",
    kicker: "Path four",
    title: "Under the anger",
    about: "What got there before the anger did — and what the anger has been trying to protect.",
    shape: WALK_SHAPE,
    patterns: ANGER,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Nobody is in trouble",
        body: "Anger is not the enemy in this walk. It is a signal. We are asking what it arrived to say.",
        reading: "You will not be asked to be less. You will be asked to look underneath.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these sound like you?",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "under",
        kind: "write",
        kicker: "Trace it",
        title: "What was there first?",
        prompt: "Before the heat — what was the thing it was standing in front of?",
        placeholder: "Underneath it, I think I was…",
      },
      {
        id: "signal",
        kind: "read",
        kicker: "Why it arrives",
        title: "Anger is usually late, not first",
        body: "Anger often shows up after something else — a slight, a threat, a loss of standing. It can be just. It can also be a cover. This walk does not decide which. It only asks what was standing in front of it.",
        notes: [
          {
            text: "In ordinary life, people report anger as a response to being wronged or blocked, not as a mood that arrives from nowhere. It can be made milder when a person has another way to say the thing — and it can also be the only honest word in the room.",
            source: "Averill JR. Studies on anger and aggression: implications for theories of emotion. American Psychologist 38(11), 1145–1160, 1983",
            url: "https://doi.org/10.1037/0003-066X.38.11.1145",
            caveat: "This is a study of how people report anger in ordinary life, not a rule about your household. The walk does not tell you to be less.",
          },
        ],
        reading: "You will not be asked to be less. You will be asked to look underneath.",
      },
      {
        id: "slow",
        kind: "scripture",
        kicker: "The other way",
        title: "Slow to anger is not the same as none",
        scripture: {
          text: "The LORD is compassionate and gracious, slow to anger, abounding in loving devotion.",
          reference: "Psalm 103:8 · BSB",
          book: "PSA",
          chapter: 103,
          verse: 8,
        },
        reading: "He is slow. He is not absent. Your anger can be heard without being allowed to run the house.",
      },
      {
        id: "listen",
        kind: "scripture",
        kicker: "The other speed",
        title: "Quick to listen is not the same as small",
        body: "The instruction is an order of operations. Listen. Then speak. Then, if it is still needed, the heat.",
        scripture: {
          text: "My beloved brothers, understand this: Everyone should be quick to listen, slow to speak, and slow to anger,",
          reference: "James 1:19 · BSB",
          book: "JAS",
          chapter: 1,
          verse: 19,
        },
        reading: "Slow is not silence. Slow is a chance for the first thing to get a word in.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "What is the anger doing?",
        buckets: [
          { id: "keep", label: "Telling the truth" },
          { id: "was", label: "Protected me once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter you will not send",
        openings: [
          "I am angry because",
          "Underneath this I am sad about",
          "I wanted you to",
          "I have been carrying this a long time.",
        ],
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what the anger has been carrying",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "Be angry, yet do not sin. Do not let the sun set upon your anger,",
          reference: "Ephesians 4:26 · BSB",
          book: "EPH",
          chapter: 4,
          verse: 26,
        },
      },
    ],
  },
];

export const PATTERNS = PATHS.flatMap((p) => p.patterns);

export function pathById(id: string) {
  return PATHS.find((p) => p.id === id);
}
