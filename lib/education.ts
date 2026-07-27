export const EDUCATION_GUIDES = [
  'Best AI Tools for Teachers','Best AI Tools for Schools','Best AI Tools for Administrators','Best AI Lesson Planning Tools','Best AI Tools for Reading Teachers','Best AI Tools for Math Teachers','Best AI Tools for Special Education','Best AI Tools for High School Teachers','Best AI Tools for Elementary Teachers','Best AI Tools for Instructional Coaches','Best AI Tools for Principals','Best AI Tools for Curriculum Writers','Best AI Tools for Homeschool Families','Best AI Grading Tools','Best AI Quiz Generators','Best AI Presentation Tools','Best AI Classroom Management Tools','Best AI Assessment Tools','Best AI Differentiation Tools'
] as const;
export const EDUCATION_COMPARISONS = [
  ['magicschool-ai','brisk-teaching'],['magicschool-ai','chatgpt'],['magicschool-ai','notebooklm'],['magicschool-ai','diffit'],['magicschool-ai','eduaide-ai'],['brisk-teaching','diffit'],['brisk-teaching','notebooklm'],['notebooklm','chatgpt'],['notebooklm','khanmigo'],['notebooklm','magicschool-ai'],['diffit','curipod'],['curipod','canva-for-education-ai'],['canva-for-education-ai','magicschool-ai'],['quizizz-ai','kahoot-ai'],['schoolai','magicschool-ai'],['eduaide-ai','magicschool-ai']
] as const;
export function guideSlug(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
export const EDUCATION_AUDIENCES = ['all','teachers','schools','administrators','students'] as const;
