# Interview Coach

Role & Objective You are an expert full-stack developer and a world-class UI/UX designer. Your task is to build a "Mock Interview Coach"—a lovable, encouraging, and highly functional web application designed to help users practice for job interviews.

The Vibe & UI/UX The design should be clean, modern, and calming. Use a soft, welcoming color palette (think slate blues, soft whites, and warm accents) to reduce interview anxiety. The interface should feel like a supportive mentor: encouraging, accessible, and intuitive. Use smooth transitions between questions and feedback states.

Tech Stack Please build this using [Insert Preferred Stack, e.g., React, Next.js, Tailwind CSS]. The app will need to make API calls to an LLM (like OpenAI's GPT-4o or Anthropic's Claude 3.5 Sonnet) to generate the feedback.

Core Features & User Flow

Welcome Screen: A friendly landing page that explains the app's purpose. It should have a "Start Interview" button.

The Question Bank: The app will pull from a hardcoded array of 136 specific interview questions (I will provide the list below). The app should randomly select a question from this list or allow the user to go sequentially.

The Interview Interface:

Display the current question clearly at the center of the screen.

Provide a large, clean text area for the user to type their answer. (Bonus points if you include a Web Speech API integration for speech-to-text input so they can practice answering out loud).

Include a "Submit Answer" button.

The Feedback Engine (LLM Integration):

When the user submits their answer, send the Question and the User's Answer to the LLM API.

System Prompt for the Feedback Engine: "You are a supportive, expert career coach. The user is practicing for a job interview. Review their answer to the provided question. Give them a "score" out of 10. Highlight one thing they did really well (praise). Point out one area where they can improve (constructive critique). Provide a rewritten 'ideal' version of their answer using the STAR method (Situation, Task, Action, Result) if applicable. Keep your tone warm, lovable, and highly encouraging."

The Feedback UI: Display the AI's feedback in a clean, easily readable card format. Include a "Next Question" button to continue the loop.

Next Steps for You (The AI): Please provide the complete boilerplate code for this application. Structure the code logically, separating the UI components from the API logic. Tell me exactly where to insert my LLM API key and where to paste my array of 136 questions.

1)     Why do you want to work here?

2)     Why would you be a good hire for this organization?

3)     How do you stay current?

4)     Why do you think this type of work would sustain

your interest over the long haul?

5)     Where do you want to be in 5 years?

6)     Describe your ideal career?

7)     If you had unlimited time and financial

resources, how would you spend them?

8)     What would you like us to know about you that we

can’t know from reading tour resume and application?

9)     Tell me what you know about us and how you came

to know it.

10) What

about us interests you the most?

11) What’s

your favorite thing we’ve done?

12) What

do you think about our marketing and events?

13) Tell

me what you think distinguishes us within our professional?

14) What

do you think it our greatest weakness?

15) What

would you do differently if you ran the organization, and why?

16) How

does this position compare, and how is it different, than previous jobs you’ve

had?

17) Do

you believe you’re overqualified for this position?

18) How

would you describe our competition?

19) Why

are you ready to leave your current role?

20) What

do you want out of your next job?

21) What’s

your dream job?

22) What

motivates you to do this kind of work?

23) What

new skills or ideas will your bring to the job that other candidates aren’t

likely to offer?

24) What

interests you most about this position?

25) What

would you like to accomplish here that you weren’t able to accomplish in your

last position?

26) How

have your motivations changed over the years?

27) What

are your key skills?

28) How

is your experience relevant to this job?

29) What

skills do you think are most critical for this job?

30) What

skills would you like to develop in this job?

31) What

skills will you need help developing to be successful in this job?

32) If

you ended up not being selected, what, in your current job, would you spend

more time on and why?

33) What

is the top thing you could do today to enrich your current job?

34) How

do you define success in your career?

35) How

do you rate yourself compared to your colleagues in the field?

36) How

would you rate your writing and verbal communication skills?

37) Give

an example of how you overcame obstacles to complete a project.

38) Describe

a time when you were assigned a task that you didn’t want to do.

39) Would

you current teammates describe you as someone who goes the extra mile? Does

your current supervisor see you the same?

40) Can

you share an example of when you didn’t perform to the level of your ability?

41) Would

you describe yourself as more concept oriented or task oriented?

42) How

do you manage stress in your daily work?

43) How

do you react when things haven’t gone as planned?

44) How

do you prioritize or juggle your workload in your current job?

45) Describe

a professional skill you’ve developed in your current position.

46) Can

you detail your philosophy of customer service and how it folds into this position?

47) Tell

me about a time when you’ve had to deal with an angry customer and how you

handled the situation.

48) How

do you manage your work week and make realistic deadlines?

49) Tell

me about a time you’ve missed a deadline.

50) What

is a personal skill or work habit that’s been a struggle for you to improve?

51) What

books do you find yourself referencing or revisiting often?

52) What

is the most creative or innovative project you’ve worked on?

53) What

is your biggest red flag about this job?

54) How

did the realities differ from your expectations in your current job?

55) What’s

your most productive work setting?

56) Do

you prefer continuity and predictable repetition or frequent change and variety

in your daily work?

57) What

part of YOU do you feel you haven’t been able to bring to the workplace in

previous jobs?

58) Why

did you pick the people you listed as your references?

59) Tell

me something you learned from a book recently.

60) Tell

me about a work group or team you enjoyed being a part of.

61) What

do you think is the most important aspect for team success?

62) Tell

me about a time you had to teach a new concept or skill to a coworker.

63) Tell

me about a time when an assignment conflicted with your personal values, and

how you handled that?

64) Tell

me about an effective leader you’ve known personally.

65) How

would you describe a management style you think is effective.

66) Describe

your personal leadership style.

67) Tell

me what you think differentiates a leader from a manager.

68) What

things impress you about your colleagues?

69) What

are some things you’ve had a supervisor do that you disliked?

70) How

do you organize and plan for major projects?

71) Describe

a time when you’ve received unsolicited feedback?

72) Tell

me about a time when you had an idea that wasn’t appreciated by your organization.

73) What

aspect of your leadership style would you like to change?

74) What

personal characteristics add to your effectiveness?

75) Describe

a leader you admire.

76) Tell

me about a learning experience that affected your leadership style.

77) How

have your technical skills been an asset?

78) Describe

how you’ve applied your technical skills to solve a problem?

79) How

do you usually go about problem solving?

80) How

pragmatic do you think you are?

81) How

do you balance data and intuition?

82) Tell

me about a problem you failed to anticipate.

83) Have

you ever resolved a long standing problem?

84) Describe

when you’ve had to make an unpopular decision.

85) What

is the most difficult problem you’ve ever dealt with?

86) Describe

a time when a problem wasn’t resolved do your satisfaction?

87) When

do you have difficulty making decisions?

88) Describe

an opportunity where you felt the risks outweighed the reward.

89) Tell

me about a major accomplishment.

90) Tell

me about your greatest team contribution.

91) What

is the most valuable contribution you’ve made to an organization?

92) Tell

me about a group or organization outside of work that’s benefited from your participation.

93) Give

an example of where you’ve delivered more than what was expected?

94) What

accomplishment is your greatest source of pride?

95) If

hired today, what would be your first goal?

96) Can

you tell me about a time you saved an organization or employer money?

97) Tell

me about a group or person you had to work with to accomplish something you

couldn’t do alone?

98) Tell

me about an accomplishment that required discipline?

99) In

your current position, what do your colleagues look to you to handle?

100)                    On a team, what is your comfortable role?

101)                    Tell me a quantifiable outcome from a team

project you’ve worked on.

102)                    What are your long term career plans?

103)                    What are your aspirations beyond this job?

104)                    What new challenges would you enjoy?

105)                    If you could start all over again, what

direction would you take your career?

106)                    What achievements have eluded you?

107)                    How long do you think you’d continue to grow in

this position?

108)                    Compare this position to others that you’re

currently pursuing.

109)                    Have you progressed in your career as you’d

expected?

110)                    Have you ever taken a position that didn’t fit

into your long term plan?

111)                    Other than work, tell me about an activity you’ve

remained interested in over several years?

112)                    What do you do in your spare time?

113)                    Do you have a balanced lifestyle?

114)                    What outside activities complement your work

interests?

115)                    Tell me about a time when you were NOT at work,

but got an idea that helped in your work.

116)                    How is your personality reflected in your

hobbies?

117)                    What leisure activities help you perform your

work better?

118)                    What do you do to relax?

119)                    If you found yourself feeling burned out, what

steps would you take to revitalize yourself?

120)                    Are there any community projects that can use

your professional skills that are interesting to you?

121)                    If you had unlimited leisure time, how would you

spend it?

122)                    Describe how an outside interest taught you a

lesson in teamwork?

123)                    Outside of work, do you stick to a schedule or

do you find you prefer to be spontaneous?

124)                    Tell me about an interest or hobby you outgrew.

125)                    Describe a movie or character from a movie that

inspires you.

126)                    Tell me about a project where you were

disappointed with your personal performance.

127)                    What has been your most difficult work

experience?

128)                    If we fast forwarded to your first annual review,

what would I be telling you right now?

129)                    Give an example of a when you were assigned a

task but not given enough information. How did you resolve this?

130)                    Describe a time when you’ve failed to resolve a

conflict?

131)                    How do you handle criticism of your work?

132)                    What aspect of your work is most often

criticized?

133)                    Tell me about a time you put your foot in your

mouth?

134)                    What are things about your last job you’d never

want to repeat?

135)                    Have you ever been passed over for a promotion

you felt you deserved?

136)                    Was there a course in your school career you

found particularly challenging?

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://coach-me-ace.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4bd84c5-5963-4e2e-b2fe-02d3d2858c84).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
