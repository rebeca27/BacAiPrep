import {
  users, type User, type InsertUser,
  subjects, type Subject, type InsertSubject,
  topics, type Topic, type InsertTopic,
  userProgress, type UserProgress, type InsertUserProgress,
  tests, type Test, type InsertTest,
  userTestResults, type UserTestResult, type InsertUserTestResult,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  studyStreaks, type StudyStreak, type InsertStudyStreak,
  studyPlanTasks, type StudyPlanTask, type InsertStudyPlanTask,
  aiChatHistory, type AiChatHistory, type InsertAiChatHistory
} from "@shared/schema";

// A more comprehensive storage interface with all the needed operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  
  // Topic operations
  getTopicsBySubject(subjectId: number): Promise<Topic[]>;
  
  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Test operations
  getAllTests(): Promise<Test[]>;
  getTestsBySubject(subjectId: number): Promise<Test[]>;
  
  // Test results operations
  getUserTestResults(userId: number): Promise<(UserTestResult & { testName: string, subjectName: string })[]>;
  saveUserTestResult(result: InsertUserTestResult): Promise<UserTestResult>;
  
  // Badge operations
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  
  // Study streak operations
  getUserStudyStreaks(userId: number): Promise<StudyStreak[]>;
  addStudyStreak(streak: InsertStudyStreak): Promise<StudyStreak>;
  
  // Study plan operations
  getUserStudyPlan(userId: number): Promise<StudyPlanTask[]>;
  addStudyPlanTask(task: InsertStudyPlanTask): Promise<StudyPlanTask>;
  updateStudyPlanTaskCompletion(userId: number, taskId: number, completed: boolean): Promise<StudyPlanTask>;
  
  // AI chat history operations
  getAiChatHistory(userId: number): Promise<AiChatHistory | undefined>;
  saveAiChatHistory(history: InsertAiChatHistory): Promise<AiChatHistory>;
  
  // Demo data initialization
  initializeDemoData(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private topics: Map<number, Topic>;
  private userProgress: Map<number, UserProgress>;
  private tests: Map<number, Test>;
  private userTestResults: Map<number, UserTestResult>;
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  private studyStreaks: Map<number, StudyStreak>;
  private studyPlanTasks: Map<number, StudyPlanTask>;
  private aiChatHistory: Map<number, AiChatHistory>;
  
  private userId: number = 1;
  private subjectId: number = 1;
  private topicId: number = 1;
  private progressId: number = 1;
  private testId: number = 1;
  private testResultId: number = 1;
  private badgeId: number = 1;
  private userBadgeId: number = 1;
  private streakId: number = 1;
  private taskId: number = 1;
  private chatHistoryId: number = 1;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.topics = new Map();
    this.userProgress = new Map();
    this.tests = new Map();
    this.userTestResults = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.studyStreaks = new Map();
    this.studyPlanTasks = new Map();
    this.aiChatHistory = new Map();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  // Topic operations
  async getTopicsBySubject(subjectId: number): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .filter(topic => topic.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists for this user and subject
    const existingProgress = Array.from(this.userProgress.values())
      .find(p => p.userId === insertProgress.userId && p.subjectId === insertProgress.subjectId);
    
    if (existingProgress) {
      const updatedProgress: UserProgress = {
        id: existingProgress.id,
        userId: existingProgress.userId,
        subjectId: existingProgress.subjectId,
        topicsCompleted: insertProgress.topicsCompleted ?? existingProgress.topicsCompleted,
        lastStudied: insertProgress.lastStudied ?? new Date(),
        percentComplete: insertProgress.percentComplete ?? existingProgress.percentComplete
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.progressId++;
      const progress: UserProgress = {
        id,
        userId: insertProgress.userId,
        subjectId: insertProgress.subjectId,
        topicsCompleted: insertProgress.topicsCompleted ?? 0,
        lastStudied: insertProgress.lastStudied ?? new Date(),
        percentComplete: insertProgress.percentComplete ?? 0
      };
      this.userProgress.set(id, progress);
      return progress;
    }
  }

  // Test operations
  async getAllTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async getTestsBySubject(subjectId: number): Promise<Test[]> {
    return Array.from(this.tests.values())
      .filter(test => test.subjectId === subjectId);
  }

  // Test results operations
  async getUserTestResults(userId: number): Promise<(UserTestResult & { testName: string, subjectName: string })[]> {
    const results = Array.from(this.userTestResults.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    
    // Enhance with test and subject information
    return results.map(result => {
      const test = this.tests.get(result.testId);
      const subject = test ? this.subjects.get(test.subjectId) : undefined;
      
      return {
        ...result,
        testName: test?.name || "Unknown Test",
        subjectName: subject?.name || "Unknown Subject"
      };
    });
  }

  async saveUserTestResult(insertResult: InsertUserTestResult): Promise<UserTestResult> {
    const id = this.testResultId++;
    const result: UserTestResult = { 
      ...insertResult, 
      id, 
      completedAt: new Date() 
    };
    this.userTestResults.set(id, result);
    return result;
  }

  // Badge operations
  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadges = Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId);
    
    return userBadges.map(userBadge => {
      const badge = this.badges.get(userBadge.badgeId);
      return {
        ...userBadge,
        badge: badge!
      };
    });
  }

  // Study streak operations
  async getUserStudyStreaks(userId: number): Promise<StudyStreak[]> {
    return Array.from(this.studyStreaks.values())
      .filter(streak => streak.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async addStudyStreak(insertStreak: InsertStudyStreak): Promise<StudyStreak> {
    const id = this.streakId++;
    const streak: StudyStreak = { 
      id,
      userId: insertStreak.userId,
      date: new Date(),
      minutesStudied: insertStreak.minutesStudied ?? 0
    };
    this.studyStreaks.set(id, streak);
    return streak;
  }

  // Study plan operations
  async getUserStudyPlan(userId: number): Promise<StudyPlanTask[]> {
    return Array.from(this.studyPlanTasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => {
        // Sort by priority first, then by recommendation
        if (a.priority !== b.priority) {
          return a.priority ? -1 : 1;
        }
        if (a.recommended !== b.recommended) {
          return a.recommended ? -1 : 1;
        }
        return 0;
      });
  }

  async addStudyPlanTask(insertTask: InsertStudyPlanTask): Promise<StudyPlanTask> {
    const id = this.taskId++;
    const task: StudyPlanTask = { 
      id,
      userId: insertTask.userId,
      title: insertTask.title,
      description: insertTask.description,
      duration: insertTask.duration,
      priority: insertTask.priority ?? false,
      recommended: insertTask.recommended ?? false,
      completed: false,
      dueDate: insertTask.dueDate ?? new Date()
    };
    this.studyPlanTasks.set(id, task);
    return task;
  }

  async updateStudyPlanTaskCompletion(userId: number, taskId: number, completed: boolean): Promise<StudyPlanTask> {
    const task = this.studyPlanTasks.get(taskId);
    
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or doesn't belong to the user");
    }
    
    const updatedTask: StudyPlanTask = {
      ...task,
      completed
    };
    
    this.studyPlanTasks.set(taskId, updatedTask);
    return updatedTask;
  }

  // AI chat history operations
  async getAiChatHistory(userId: number): Promise<AiChatHistory | undefined> {
    return Array.from(this.aiChatHistory.values())
      .find(history => history.userId === userId);
  }

  async saveAiChatHistory(insertHistory: InsertAiChatHistory): Promise<AiChatHistory> {
    const existingHistory = await this.getAiChatHistory(insertHistory.userId);
    
    if (existingHistory) {
      const updatedHistory: AiChatHistory = {
        ...existingHistory,
        messages: insertHistory.messages,
        updatedAt: new Date()
      };
      this.aiChatHistory.set(existingHistory.id, updatedHistory);
      return updatedHistory;
    } else {
      const id = this.chatHistoryId++;
      const now = new Date();
      const history: AiChatHistory = { 
        ...insertHistory, 
        id, 
        createdAt: now,
        updatedAt: now
      };
      this.aiChatHistory.set(id, history);
      return history;
    }
  }

  // Initialize demo data
  async initializeDemoData(): Promise<void> {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "andrei",
      password: "password",
      displayName: "Andrei Munteanu",
      email: "andrei@example.com"
    };
    const user = await this.createUser(demoUser);

    // Create subjects
    const subjectData: InsertSubject[] = [
      {
        name: "Romanian",
        description: "Romanian Language and Literature",
        totalTopics: 18,
        icon: "ri-book-open-line"
      },
      {
        name: "Mathematics",
        description: "Algebra, Geometry, and Calculus",
        totalTopics: 14,
        icon: "ri-calculator-line"
      },
      {
        name: "English",
        description: "Grammar, Vocabulary, and Comprehension",
        totalTopics: 16,
        icon: "ri-translate-2"
      },
      {
        name: "Biology",
        description: "Cell Structure, Human Anatomy, and Ecology",
        totalTopics: 17,
        icon: "ri-microscope-line"
      }
    ];

    const subjectMap = new Map<string, Subject>();
    
    for (const data of subjectData) {
      const id = this.subjectId++;
      const subject: Subject = { ...data, id };
      this.subjects.set(id, subject);
      subjectMap.set(subject.name, subject);
    }
    
    // Create topics for each subject
    // Romanian topics
    const romanianTopics: InsertTopic[] = [
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Introduction to Romanian Literature",
        description: "Overview of Romanian literary periods and major authors",
        content: "<p>Romanian literature developed later than many other European national literatures, with literature in the Romanian language first being published in the 1640s. However, it has a rich oral tradition dating back much earlier.</p><p>The main periods of Romanian literature are:</p><ul><li><b>Medieval Period</b> (16th-18th centuries): Religious texts and chronicles</li><li><b>Romantic Period</b> (19th century): Works of Mihai Eminescu, Vasile Alecsandri</li><li><b>Interwar Period</b>: Works of Liviu Rebreanu, Mihail Sadoveanu</li><li><b>Contemporary Period</b>: Post-WWII to present</li></ul>",
        order: 1,
        difficulty: "easy"
      },
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Romanian Grammar - Noun Cases",
        description: "Understanding the case system in Romanian language",
        content: "<p>Romanian grammar has a relatively complex case system with five cases: Nominative, Accusative, Genitive, Dative, and Vocative.</p><h3>The Five Cases</h3><ul><li><b>Nominative Case (Nominativ)</b>: Used for the subject of the sentence. Example: <i>Cartea este pe masă.</i> (The book is on the table.)</li><li><b>Accusative Case (Acuzativ)</b>: Used for the direct object. Example: <i>Citesc cartea.</i> (I am reading the book.)</li><li><b>Genitive Case (Genitiv)</b>: Shows possession. Example: <i>Pagina cărții este ruptă.</i> (The page of the book is torn.)</li><li><b>Dative Case (Dativ)</b>: Used for the indirect object. Example: <i>I-am dat elevului o carte.</i> (I gave the student a book.)</li><li><b>Vocative Case (Vocativ)</b>: Used for direct address. Example: <i>Domnule profesor!</i> (Mr. Teacher!)</li></ul><p>In Romanian, the Nominative and Accusative forms are identical for most nouns, as are the Genitive and Dative forms. The Vocative case has some distinctive endings, particularly for masculine nouns.</p><h3>Articles in Romanian</h3><p>Romanian uses three types of articles:</p><ul><li><b>Definite articles</b>: Attached as suffixes to the noun (e.g., <i>masă</i> → <i>masa</i> / table → the table)</li><li><b>Indefinite articles</b>: Stand before the noun (e.g., <i>o masă</i> / a table)</li><li><b>Possessive or genitival articles</b>: Used in genitival constructions (e.g., <i>cartea elevului</i> / the student's book)</li></ul>",
        order: 2,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Mihai Eminescu - Life and Works",
        description: "Study of Romania's national poet and his major works",
        content: "<p>Mihai Eminescu (1850-1889) is considered Romania's national poet and one of the most significant figures in Romanian literature.</p><h3>Biography</h3><p>Born in Botoșani, Eminescu studied in Cernăuți and Vienna, and worked as a journalist, school inspector, and librarian. His life was marked by hardship and he died at a young age after suffering from mental illness.</p><h3>Literary Style and Themes</h3><p>Eminescu's writing is characterized by philosophical depth, romantic sensibility, and masterful use of language. Common themes include:</p><ul><li>Nature and cosmic harmony</li><li>Love and loss</li><li>National identity and historical consciousness</li><li>Human existence and philosophical reflection</li></ul><h3>Major Works</h3><ul><li><b>Luceafărul (The Evening Star, 1883)</b>: His masterpiece, a narrative poem based on Romanian folklore that explores the impossible love between a mortal princess and a celestial being. Key excerpt:<br><i>\"Cobori în jos, luceafăr blând,<br>Alunecând pe-o rază,<br>Pătrunde-n casă și în gând<br>Și viața-mi luminează!\"</i></li><li><b>Scrisori (Letters)</b>: A series of philosophical and satirical poems examining Romanian society and politics</li><li><b>Floare albastră (Blue Flower)</b>: A romantic poem that exemplifies his lyrical style and references the blue flower motif from German Romanticism</li><li><b>Odă (în metru antic)</b>: A meditation on suffering and transcendence</li></ul><h3>Bacalaureat Exam Tips</h3><p>For the exam, focus on:</p><ul><li>Analyzing Eminescu's romantic themes and philosophical perspectives</li><li>Understanding his contribution to Romanian literary language</li><li>Being able to analyze key poems, particularly Luceafărul</li><li>Recognizing his influence on subsequent Romanian literature</li></ul>",
        order: 3,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Ion Creangă - Childhood Memories",
        description: "Analysis of Creangă's autobiographical work",
        content: "<p>Ion Creangă (1837-1889) was a significant Romanian writer, known for his autobiographical work 'Amintiri din copilărie' (Memories of Childhood).</p><h3>Structure and Composition</h3><p>This work is divided into four parts and describes the author's childhood in the Moldavian countryside with vivid descriptions, humor, and authentic regional language. It was published between 1881 and 1882 in Junimea's literary journal 'Convorbiri Literare'.</p><h3>Key Themes</h3><ul><li><b>The contrast between rural life and formal education</b>: Creangă depicts his journey from the village to formal schooling in Iași</li><li><b>Coming-of-age experiences and moral lessons</b>: Through various episodes, the narrator learns about life and morality</li><li><b>Traditional Romanian village culture and customs</b>: The text provides a rich ethnographic portrayal of 19th century rural life</li><li><b>Humor and authenticity</b>: Creangă's narrative voice is marked by wit, folk wisdom, and colloquial expressions</li></ul><h3>Narrative Technique</h3><p>The work uses first-person narration with a dual perspective: the child who experiences the events and the adult who narrates them with nostalgic reflection. This creates both immediacy and retrospective wisdom.</p><h3>Memorable Episodes</h3><ul><li>The cherry tree episode, where young Ion climbs a cherry tree and cannot come down</li><li>The bath in the Ozana River, illustrating childhood freedom and joy</li><li>The encounter with the strict teacher, Popa Duhu</li><li>The stealing of grandmother's cherries, demonstrating childhood mischief and subsequent moral lessons</li></ul><h3>Literary Significance</h3><p>Creangă's work represents a fundamental text in Romanian literature because:</p><ul><li>It captures authentic Romanian rural life and mentality</li><li>It preserves regional linguistic expressions and folk wisdom</li><li>It combines humor with profound observations about human nature</li><li>It portrays childhood as both idyllic and formative</li></ul>",
        order: 4,
        difficulty: "hard"
      },
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Essay Writing for Bacalaureat - Literary Analysis",
        description: "Techniques for structuring and writing literary analysis essays",
        content: "<h3>Literary Analysis Essay Structure</h3><p>For the Bacalaureat exam, literary analysis essays typically follow this structure:</p><ol><li><b>Introduction (Introducere)</b><ul><li>Contextualize the author and work</li><li>Present your thesis statement (ideea centrală)</li><li>Mention the main points you will analyze</li></ul></li><li><b>Body Paragraphs (Cuprins)</b><ul><li>Analyze themes (teme)</li><li>Examine characters (personaje)</li><li>Discuss narrative techniques (tehnici narative)</li><li>Explore language and style (limbaj și stil)</li><li>Include relevant quotations as evidence</li></ul></li><li><b>Conclusion (Încheiere)</b><ul><li>Restate your main argument</li><li>Emphasize the significance of the work</li><li>Connect to broader literary or cultural context</li></ul></li></ol><h3>Essential Elements to Address</h3><p>For most literary works, your analysis should include:</p><ul><li><b>Themes and motifs</b>: Identify and analyze major themes (e.g., love, death, nature, social criticism)</li><li><b>Characters</b>: Analyze main characters' motivations, development, and symbolic significance</li><li><b>Literary devices</b>: Identify key techniques (metaphor, personification, alliteration, etc.)</li><li><b>Historical and cultural context</b>: Place the work within its literary movement and historical period</li><li><b>Personal interpretation</b>: Offer thoughtful, supported interpretations of the work's meaning</li></ul><h3>Example Thesis Statements</h3><p>For Eminescu's \"Luceafărul\":</p><blockquote>\"Prin antiteza dintre Hyperion și Cătălina, Eminescu explorează incompatibilitatea fundamentală dintre geniul creator și lumea comună, reflectând astfel propria sa condiție de poet romantic.\"</blockquote><p>For Creangă's \"Amintiri din copilărie\":</p><blockquote>\"Opera lui Creangă îmbină perspectiva naivă a copilului cu înțelepciunea nostalgică a adultului, creând astfel o imagine autentică a universului rural românesc din secolul al XIX-lea.\"</blockquote><h3>Common Mistakes to Avoid</h3><ul><li>Summarizing the plot instead of analyzing it</li><li>Making claims without textual evidence</li><li>Using vague or general statements</li><li>Ignoring the historical and cultural context</li><li>Overusing literary terminology without proper understanding</li></ul><h3>Practical Tips</h3><ul><li>Prepare key quotes from major works in advance</li><li>Practice timing yourself (approximately 120 minutes for the essay)</li><li>Structure your time: 15 minutes planning, 90 minutes writing, 15 minutes reviewing</li><li>Use appropriate academic language and literary terminology</li><li>Develop a clear, logical argument throughout your essay</li></ul>",
        order: 5,
        difficulty: "hard"
      },
      {
        subjectId: subjectMap.get("Romanian")!.id,
        name: "Modern Romanian Novel - Liviu Rebreanu's 'Ion'",
        description: "Analysis of the first modern Romanian novel and its themes",
        content: "<h3>Introduction to 'Ion'</h3><p>Published in 1920, 'Ion' by Liviu Rebreanu (1885-1944) is considered the first modern Romanian novel and a landmark of Romanian realism. The novel portrays rural Transylvanian life at the beginning of the 20th century, focusing on the peasant's relationship with the land.</p><h3>Plot Overview</h3><p>The novel tells the story of Ion Pop al Glanetașului, a poor but ambitious peasant who is determined to acquire land at any cost. His obsession with land leads him to marry Ana, the daughter of a wealthy peasant, despite loving Florica. After achieving his goal of owning land, Ion returns to his true love, Florica, neglecting his wife. Ana, humiliated and desperate, commits suicide after giving birth to their child. Later, Ion is killed by Ana's brother, George, who takes revenge for his sister's suffering.</p><h3>Main Themes</h3><ul><li><b>The obsession with land ('glasul pământului')</b>: The central theme of the novel, represented by Ion's desperate desire to own land, even at the cost of human relationships</li><li><b>The call of love ('glasul iubirii')</b>: Contrasted with the obsession with land, showing the conflict between material desires and emotional needs</li><li><b>Social determinism</b>: Characters' actions are determined by their social environment and economic conditions</li><li><b>Rural society and its customs</b>: Detailed exploration of village life, traditions, and social hierarchies</li><li><b>Tragedy of human existence</b>: The inevitability of suffering and death as a result of human passions and social constraints</li></ul><h3>Literary Techniques</h3><ul><li><b>Objective narrative</b>: Rebreanu uses a detached, omniscient narrator to present events without explicit moral judgment</li><li><b>Psychological depth</b>: Characters have complex inner lives and motivations</li><li><b>Naturalistic description</b>: Detailed depictions of the physical environment and human hardships</li><li><b>Circular structure</b>: The novel begins and ends with a village dance, symbolizing the continuity of rural life despite individual tragedies</li><li><b>Symbolic elements</b>: The land itself becomes a character in the novel, while the dance scenes represent community and vitality</li></ul><h3>Key Characters</h3><ul><li><b>Ion Pop al Glanetașului</b>: The protagonist, driven by his hunger for land</li><li><b>Ana Baciu</b>: Ion's wife, victim of his ambition</li><li><b>Florica</b>: Ion's true love, whom he sacrifices for economic gain</li><li><b>Vasile Baciu</b>: Ana's father, a wealthy peasant</li><li><b>George Bulbuc</b>: Ana's former fiancé who eventually kills Ion</li><li><b>Titu Herdelea</b>: The intellectual character who observes village life from a different perspective</li></ul><h3>Historical Context</h3><p>The novel is set in Transylvania before World War I, when it was still part of the Austro-Hungarian Empire. It portrays the ethnic tensions between Romanians and Hungarians, as well as the difficult economic conditions of Romanian peasants.</p><h3>Literary Significance</h3><p>'Ion' marks a turning point in Romanian literature, moving from romantic and idyllic portrayals of rural life to a more realistic and critical approach. Rebreanu's objective style and psychological complexity established new standards for the Romanian novel.</p><h3>Critical Analysis for Bacalaureat</h3><p>For your exam, be prepared to analyze:</p><ul><li>The novel's structure and narrative techniques</li><li>The psychological portrayal of the main character</li><li>The symbolic opposition between 'the voice of the land' and 'the voice of love'</li><li>The social critique embedded in the novel</li><li>Rebreanu's contribution to Romanian literary realism</li></ul>",
        order: 6,
        difficulty: "medium"
      }
    ];
    
    // Mathematics topics
    const mathTopics: InsertTopic[] = [
      {
        subjectId: subjectMap.get("Mathematics")!.id,
        name: "Algebra Fundamentals",
        description: "Basic algebraic concepts and equations",
        content: `<h3>Introduction to Algebraic Concepts</h3>
<p>Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols. It forms the foundation for advanced mathematical concepts and is essential for solving complex problems.</p>

<h3>Linear Equations</h3>
<p>A linear equation takes the form ax + b = c, where a, b, and c are constants, and x is the variable.</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Solving 2x + 5 = 13</h4>
  <p>Step 1: Subtract 5 from both sides.<br>
  2x + 5 - 5 = 13 - 5<br>
  2x = 8</p>
  
  <p>Step 2: Divide both sides by 2.<br>
  2x/2 = 8/2<br>
  x = 4</p>

  <p>Therefore, x = 4 is the solution.</p>
</div>

<h3>Quadratic Equations</h3>
<p>A quadratic equation takes the form ax² + bx + c = 0, where a, b, and c are constants with a ≠ 0.</p>

<p>Quadratic equations can be solved using several methods:</p>
<ol>
  <li><b>Factoring</b>: Write the equation in the form (x + p)(x + q) = 0</li>
  <li><b>Completing the square</b>: Rearrange the equation to create a perfect square trinomial</li>
  <li><b>Quadratic formula</b>: x = (-b ± √(b² - 4ac)) / 2a</li>
</ol>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Solving x² - 5x + 6 = 0 by factoring</h4>
  <p>Find factors of 6 that add up to -5: -2 and -3<br>
  x² - 5x + 6 = 0<br>
  (x - 2)(x - 3) = 0</p>
  
  <p>Therefore, x = 2 or x = 3</p>
</div>

<h3>Functions</h3>
<p>A function is a relation between a set of inputs (domain) and a set of outputs (range), where each input is related to exactly one output.</p>

<p><b>Key function concepts:</b></p>
<ul>
  <li><b>Domain</b>: The set of all possible input values</li>
  <li><b>Range</b>: The set of all possible output values</li>
  <li><b>Function notation</b>: f(x) represents the output when x is the input</li>
</ul>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <!-- Coordinate system -->
    <line x1="0" y1="150" x2="300" y2="150" stroke="black" stroke-width="1"/>
    <line x1="150" y1="0" x2="150" y2="300" stroke="black" stroke-width="1"/>
    
    <!-- Ticks on x-axis -->
    <line x1="50" y1="145" x2="50" y2="155" stroke="black" stroke-width="1"/>
    <line x1="100" y1="145" x2="100" y2="155" stroke="black" stroke-width="1"/>
    <line x1="200" y1="145" x2="200" y2="155" stroke="black" stroke-width="1"/>
    <line x1="250" y1="145" x2="250" y2="155" stroke="black" stroke-width="1"/>
    
    <!-- Ticks on y-axis -->
    <line x1="145" y1="50" x2="155" y2="50" stroke="black" stroke-width="1"/>
    <line x1="145" y1="100" x2="155" y2="100" stroke="black" stroke-width="1"/>
    <line x1="145" y1="200" x2="155" y2="200" stroke="black" stroke-width="1"/>
    <line x1="145" y1="250" x2="155" y2="250" stroke="black" stroke-width="1"/>
    
    <!-- Parabola for f(x) = x^2 - 2x - 3 -->
    <path d="M 30,250 Q 150,50 270,250" fill="none" stroke="blue" stroke-width="2"/>
    
    <!-- Labels -->
    <text x="280" y="145" font-size="12">x</text>
    <text x="155" y="20" font-size="12">y</text>
    <text x="160" y="70" font-size="12">f(x) = x² - 2x - 3</text>
  </svg>
</div>

<h3>Polynomials</h3>
<p>Polynomials are expressions consisting of variables and coefficients using operations of addition, subtraction, multiplication, and non-negative integer exponents.</p>

<p><b>Operations with polynomials:</b></p>
<ul>
  <li><b>Addition and subtraction</b>: Combine like terms</li>
  <li><b>Multiplication</b>: Use the distributive property (FOIL method for binomials)</li>
  <li><b>Factoring</b>: Express as a product of simpler polynomials</li>
  <li><b>Division</b>: Use long division or synthetic division</li>
</ul>

<h3>Systems of Equations</h3>
<p>A system of equations consists of two or more equations with multiple variables. Solutions are values that satisfy all equations simultaneously.</p>

<p><b>Methods for solving:</b></p>
<ul>
  <li><b>Substitution method</b>: Solve for one variable and substitute</li>
  <li><b>Elimination method</b>: Add or subtract equations to eliminate a variable</li>
  <li><b>Matrix method</b>: Use matrices and determinants</li>
</ul>

<h3>Bacalaureat Exam Tips</h3>
<ul>
  <li>Always check your solutions by substituting back into the original equations</li>
  <li>Practice factoring methods for different types of expressions</li>
  <li>Know how to apply the quadratic formula quickly and accurately</li>
  <li>Understand domain restrictions for functions (especially rational functions)</li>
</ul>`,
        order: 1,
        difficulty: "easy"
      },
      {
        subjectId: subjectMap.get("Mathematics")!.id,
        name: "Geometry - Triangles",
        description: "Properties and theorems related to triangles",
        content: `<h3>Triangle Classification</h3>
<p>Triangles can be classified by both their sides and angles:</p>

<h4>Classification by Sides:</h4>
<ul>
  <li><b>Equilateral triangle</b>: All three sides are equal in length</li>
  <li><b>Isosceles triangle</b>: Two sides are equal in length</li>
  <li><b>Scalene triangle</b>: All sides have different lengths</li>
</ul>

<div style="text-align: center; margin: 20px 0; display: flex; justify-content: space-around;">
  <!-- Equilateral Triangle -->
  <div style="text-align: center;">
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,10 110,100 10,100" fill="none" stroke="blue" stroke-width="2"/>
      <!-- Side labels -->
      <text x="55" y="50" font-size="12">a</text>
      <text x="30" y="100" font-size="12">a</text>
      <text x="85" y="100" font-size="12">a</text>
    </svg>
    <p>Equilateral</p>
  </div>
  
  <!-- Isosceles Triangle -->
  <div style="text-align: center;">
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,10 100,100 20,100" fill="none" stroke="green" stroke-width="2"/>
      <!-- Side labels -->
      <text x="35" y="50" font-size="12">b</text>
      <text x="80" y="50" font-size="12">b</text>
      <text x="60" y="105" font-size="12">c</text>
    </svg>
    <p>Isosceles</p>
  </div>
  
  <!-- Scalene Triangle -->
  <div style="text-align: center;">
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,20 100,60 20,90" fill="none" stroke="red" stroke-width="2"/>
      <!-- Side labels -->
      <text x="70" y="35" font-size="12">p</text>
      <text x="60" y="80" font-size="12">q</text>
      <text x="25" y="55" font-size="12">r</text>
    </svg>
    <p>Scalene</p>
  </div>
</div>

<h4>Classification by Angles:</h4>
<ul>
  <li><b>Acute triangle</b>: All three angles are less than 90°</li>
  <li><b>Right triangle</b>: One angle is exactly 90°</li>
  <li><b>Obtuse triangle</b>: One angle is greater than 90°</li>
</ul>

<h3>Key Triangle Properties</h3>

<p><b>Angle Sum Property:</b> The sum of the interior angles of any triangle is 180°.</p>
<p><b>Triangle Inequality Theorem:</b> The sum of the lengths of any two sides must be greater than the length of the remaining side.</p>

<h3>The Pythagorean Theorem</h3>
<p>In a right triangle, the square of the length of the hypotenuse (c) is equal to the sum of squares of the other two sides (a and b):</p>
<p style="text-align: center; font-weight: bold;">a² + b² = c²</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Finding the hypotenuse</h4>
  <p>If a = 3 units and b = 4 units, find c.</p>
  <p>c² = a² + b² = 3² + 4² = 9 + 16 = 25</p>
  <p>c = √25 = 5 units</p>
  
  <div style="text-align: center; margin-top: 10px;">
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <!-- Right triangle -->
      <polygon points="20,130 20,30 170,130" fill="none" stroke="black" stroke-width="2"/>
      <!-- Right angle marker -->
      <polyline points="35,130 35,115 50,115" fill="none" stroke="black" stroke-width="1"/>
      <!-- Side labels -->
      <text x="10" y="80" font-size="12">a = 3</text>
      <text x="90" y="145" font-size="12">b = 4</text>
      <text x="90" y="80" font-size="12" style="font-style: italic;">c = 5</text>
    </svg>
  </div>
</div>

<h3>Congruence and Similarity</h3>

<h4>Triangle Congruence Criteria:</h4>
<ul>
  <li><b>SSS (Side-Side-Side)</b>: All three pairs of corresponding sides are equal</li>
  <li><b>SAS (Side-Angle-Side)</b>: Two pairs of sides and the included angle are equal</li>
  <li><b>ASA (Angle-Side-Angle)</b>: Two pairs of angles and the included side are equal</li>
  <li><b>AAS (Angle-Angle-Side)</b>: Two pairs of angles and one pair of non-included sides are equal</li>
</ul>

<h4>Triangle Similarity Criteria:</h4>
<ul>
  <li><b>AAA (Angle-Angle-Angle)</b>: All three pairs of corresponding angles are equal</li>
  <li><b>SAS (Side-Angle-Side)</b>: Two pairs of sides are proportional and the included angles are equal</li>
  <li><b>SSS (Side-Side-Side)</b>: All three pairs of corresponding sides are proportional</li>
</ul>

<h3>Area Formulas</h3>
<ul>
  <li><b>Basic formula</b>: A = (1/2) × b × h, where b is the base and h is the height</li>
  <li><b>Heron's formula</b>: A = √(s(s-a)(s-b)(s-c)), where s = (a+b+c)/2 is the semi-perimeter</li>
  <li><b>Trigonometric formula</b>: A = (1/2) × a × b × sin(C), where C is the angle between sides a and b</li>
</ul>

<h3>Special Points in a Triangle</h3>
<ul>
  <li><b>Centroid</b>: The point where the three medians intersect</li>
  <li><b>Circumcenter</b>: The point equidistant from all three vertices</li>
  <li><b>Orthocenter</b>: The point where the three altitudes intersect</li>
  <li><b>Incenter</b>: The point equidistant from all three sides</li>
</ul>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="260" xmlns="http://www.w3.org/2000/svg">
    <!-- Triangle -->
    <polygon points="30,230 270,230 150,30" fill="none" stroke="black" stroke-width="2"/>
    
    <!-- Medians -->
    <line x1="30" y1="230" x2="210" y2="130" stroke="blue" stroke-width="1" stroke-dasharray="5,3"/>
    <line x1="270" y1="230" x2="90" y2="130" stroke="blue" stroke-width="1" stroke-dasharray="5,3"/>
    <line x1="150" y1="30" x2="150" y2="230" stroke="blue" stroke-width="1" stroke-dasharray="5,3"/>
    
    <!-- Centroid -->
    <circle cx="150" cy="163.33" r="5" fill="blue"/>
    <text x="160" y="170" font-size="12" fill="blue">G (Centroid)</text>
  </svg>
</div>

<h3>Bacalaureat Exam Tips</h3>
<ul>
  <li>Memorize the formulas for area calculations</li>
  <li>Practice identifying congruent and similar triangles</li>
  <li>Learn to apply the Pythagorean theorem and its extensions</li>
  <li>Understand how to use coordinate geometry to solve triangle problems</li>
</ul>`,
        order: 2,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("Mathematics")!.id,
        name: "Calculus - Limits and Derivatives",
        description: "Introduction to calculus concepts",
        content: `<h3>Introduction to Calculus</h3>
<p>Calculus is the mathematical study of continuous change, divided into two major branches:</p>
<ul>
  <li><b>Differential calculus</b>: Concerned with rates of change and slopes of curves</li>
  <li><b>Integral calculus</b>: Concerned with accumulation of quantities and areas under curves</li>
</ul>

<h3>Limits</h3>
<p>A limit describes the behavior of a function as its input approaches a particular value.</p>

<p>Notation: lim<sub>x→a</sub> f(x) = L means that as x approaches a, f(x) approaches L.</p>

<h4>Properties of Limits:</h4>
<ul>
  <li>lim<sub>x→a</sub> [f(x) + g(x)] = lim<sub>x→a</sub> f(x) + lim<sub>x→a</sub> g(x)</li>
  <li>lim<sub>x→a</sub> [f(x) × g(x)] = lim<sub>x→a</sub> f(x) × lim<sub>x→a</sub> g(x)</li>
  <li>lim<sub>x→a</sub> [f(x)/g(x)] = lim<sub>x→a</sub> f(x) / lim<sub>x→a</sub> g(x), provided lim<sub>x→a</sub> g(x) ≠ 0</li>
</ul>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Finding a limit</h4>
  <p>Calculate lim<sub>x→2</sub> (x² - 4)/(x - 2)</p>
  
  <p>Direct substitution gives (2² - 4)/(2 - 2) = 0/0, which is indeterminate.</p>
  
  <p>Factoring the numerator:<br>
  lim<sub>x→2</sub> (x² - 4)/(x - 2) = lim<sub>x→2</sub> ((x - 2)(x + 2))/(x - 2) = lim<sub>x→2</sub> (x + 2) = 2 + 2 = 4</p>
</div>

<h3>Continuity</h3>
<p>A function f(x) is continuous at x = a if:</p>
<ol>
  <li>f(a) is defined</li>
  <li>lim<sub>x→a</sub> f(x) exists</li>
  <li>lim<sub>x→a</sub> f(x) = f(a)</li>
</ol>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <!-- Coordinate system -->
    <line x1="0" y1="100" x2="300" y2="100" stroke="black" stroke-width="1"/>
    <line x1="150" y1="0" x2="150" y2="200" stroke="black" stroke-width="1"/>
    
    <!-- Function with discontinuity -->
    <path d="M 50,150 L 140,100" stroke="blue" stroke-width="2"/>
    <path d="M 160,80 L 250,30" stroke="blue" stroke-width="2"/>
    
    <!-- Open and closed circles at discontinuity -->
    <circle cx="140" cy="100" r="4" fill="white" stroke="blue" stroke-width="2"/>
    <circle cx="160" cy="80" r="4" fill="blue" stroke="blue" stroke-width="2"/>
    
    <!-- Labels -->
    <text x="145" y="115" font-size="12">a</text>
    <text x="250" y="15" font-size="12">f(x)</text>
  </svg>
</div>

<h3>Derivatives</h3>
<p>The derivative of a function represents its rate of change. It measures the steepness of the function's graph at any point.</p>

<p>The derivative of f(x) is denoted by f'(x) or df/dx.</p>

<p>Definition: f'(x) = lim<sub>h→0</sub> [f(x+h) - f(x)]/h</p>

<h4>Basic Derivative Rules:</h4>
<ul>
  <li><b>Constant rule</b>: If f(x) = c, then f'(x) = 0</li>
  <li><b>Power rule</b>: If f(x) = x<sup>n</sup>, then f'(x) = n·x<sup>n-1</sup></li>
  <li><b>Sum rule</b>: If f(x) = g(x) + h(x), then f'(x) = g'(x) + h'(x)</li>
  <li><b>Product rule</b>: If f(x) = g(x)·h(x), then f'(x) = g'(x)·h(x) + g(x)·h'(x)</li>
  <li><b>Quotient rule</b>: If f(x) = g(x)/h(x), then f'(x) = [g'(x)·h(x) - g(x)·h'(x)]/[h(x)]²</li>
  <li><b>Chain rule</b>: If f(x) = g(h(x)), then f'(x) = g'(h(x))·h'(x)</li>
</ul>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Finding derivatives</h4>
  <p>Find the derivative of f(x) = x² + 3x - 2</p>
  
  <p>Using the sum rule and power rule:<br>
  f'(x) = (x²)' + (3x)' + (-2)'<br>
  f'(x) = 2x + 3 + 0<br>
  f'(x) = 2x + 3</p>
  
  <p>Find the derivative of g(x) = sin(x²)</p>
  
  <p>Using the chain rule:<br>
  g'(x) = cos(x²) · (x²)'<br>
  g'(x) = cos(x²) · 2x<br>
  g'(x) = 2x · cos(x²)</p>
</div>

<h3>Applications of Derivatives</h3>

<h4>Finding Extrema (Maxima and Minima):</h4>
<p>Critical points occur where f'(x) = 0 or f'(x) is undefined.</p>
<p>Second derivative test: If f'(x) = 0 and f''(x) > 0, then f(x) has a local minimum at x.</p>
<p>If f'(x) = 0 and f''(x) < 0, then f(x) has a local maximum at x.</p>

<h4>Rate of Change Problems:</h4>
<p>Derivatives can be used to solve problems involving velocity, acceleration, and other rates of change in physics and real-world scenarios.</p>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <!-- Coordinate system -->
    <line x1="0" y1="100" x2="300" y2="100" stroke="black" stroke-width="1"/>
    <line x1="150" y1="0" x2="150" y2="200" stroke="black" stroke-width="1"/>
    
    <!-- Function curve -->
    <path d="M 20,180 Q 70,20 150,100 T 280,20" fill="none" stroke="blue" stroke-width="2"/>
    
    <!-- Tangent line at a point -->
    <line x1="100" y1="60" x2="200" y2="140" stroke="red" stroke-width="1"/>
    <circle cx="150" cy="100" r="4" fill="red"/>
    
    <!-- Labels -->
    <text x="155" y="95" font-size="10">P</text>
    <text x="200" y="160" font-size="10" fill="red">Tangent line</text>
    <text x="250" y="15" font-size="12">f(x)</text>
  </svg>
</div>

<h3>Optimization Problems</h3>
<p>Many real-world problems involve finding the maximum or minimum value of a function, such as:</p>
<ul>
  <li>Maximizing area or volume with fixed perimeter or surface area</li>
  <li>Minimizing cost or time under certain constraints</li>
  <li>Finding the most efficient path or method</li>
</ul>

<h3>Bacalaureat Exam Tips</h3>
<ul>
  <li>Memorize the standard derivative formulas and rules</li>
  <li>Practice finding limits using algebraic techniques</li>
  <li>Learn to identify when to apply different derivative rules</li>
  <li>Understand the relationship between the graph of a function and its derivatives</li>
  <li>Practice solving optimization problems</li>
</ul>`,
        order: 3,
        difficulty: "hard"
      },
      {
        subjectId: subjectMap.get("Mathematics")!.id,
        name: "Probability and Statistics",
        description: "Fundamentals of probability theory and statistical analysis",
        content: `<h3>Introduction to Probability</h3>
<p>Probability measures the likelihood of an event occurring. It is expressed as a value between 0 (impossible) and 1 (certain).</p>

<h4>Basic Concepts:</h4>
<ul>
  <li><b>Experiment</b>: A process with an uncertain outcome</li>
  <li><b>Sample space (S)</b>: The set of all possible outcomes</li>
  <li><b>Event (E)</b>: A subset of the sample space</li>
</ul>

<h4>Probability Formulas:</h4>
<p><b>Classical definition</b>: P(E) = Number of favorable outcomes / Total number of possible outcomes</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Die Rolling</h4>
  <p>When rolling a fair six-sided die, the probability of getting an even number is:</p>
  <p>P(even) = Number of even outcomes / Total outcomes = 3/6 = 1/2</p>
  
  <div style="display: flex; justify-content: center; margin-top: 10px;">
    <svg width="240" height="60" xmlns="http://www.w3.org/2000/svg">
      <!-- Die faces -->
      <rect x="10" y="10" width="30" height="30" fill="white" stroke="black"/>
      <circle cx="25" cy="25" r="3" fill="black"/>
      
      <rect x="50" y="10" width="30" height="30" fill="white" stroke="black"/>
      <circle cx="60" cy="20" r="3" fill="black"/>
      <circle cx="70" cy="30" r="3" fill="black"/>
      
      <rect x="90" y="10" width="30" height="30" fill="white" stroke="black"/>
      <circle cx="100" cy="20" r="3" fill="black"/>
      <circle cx="105" cy="25" r="3" fill="black"/>
      <circle cx="110" cy="30" r="3" fill="black"/>
      
      <rect x="130" y="10" width="30" height="30" fill="lightblue" stroke="black"/>
      <circle cx="137" cy="17" r="3" fill="black"/>
      <circle cx="153" cy="17" r="3" fill="black"/>
      <circle cx="137" cy="33" r="3" fill="black"/>
      <circle cx="153" cy="33" r="3" fill="black"/>
      
      <rect x="170" y="10" width="30" height="30" fill="lightblue" stroke="black"/>
      <circle cx="177" cy="17" r="3" fill="black"/>
      <circle cx="193" cy="17" r="3" fill="black"/>
      <circle cx="185" cy="25" r="3" fill="black"/>
      <circle cx="177" cy="33" r="3" fill="black"/>
      <circle cx="193" cy="33" r="3" fill="black"/>
      
      <rect x="210" y="10" width="30" height="30" fill="lightblue" stroke="black"/>
      <circle cx="217" cy="17" r="3" fill="black"/>
      <circle cx="217" cy="25" r="3" fill="black"/>
      <circle cx="217" cy="33" r="3" fill="black"/>
      <circle cx="233" cy="17" r="3" fill="black"/>
      <circle cx="233" cy="25" r="3" fill="black"/>
      <circle cx="233" cy="33" r="3" fill="black"/>
      
      <!-- Labels -->
      <text x="18" y="55" font-size="12">1</text>
      <text x="58" y="55" font-size="12">2</text>
      <text x="98" y="55" font-size="12">3</text>
      <text x="138" y="55" font-size="12">4</text>
      <text x="178" y="55" font-size="12">5</text>
      <text x="218" y="55" font-size="12">6</text>
    </svg>
  </div>
</div>

<h3>Probability Rules</h3>

<h4>Addition Rule:</h4>
<p>P(A ∪ B) = P(A) + P(B) - P(A ∩ B)</p>
<p>For mutually exclusive events: P(A ∪ B) = P(A) + P(B)</p>

<h4>Multiplication Rule:</h4>
<p>P(A ∩ B) = P(A) × P(B|A)</p>
<p>For independent events: P(A ∩ B) = P(A) × P(B)</p>

<h4>Conditional Probability:</h4>
<p>P(A|B) = P(A ∩ B) / P(B), where P(B) > 0</p>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <!-- Venn diagram -->
    <rect x="20" y="20" width="260" height="160" fill="#f8f9fa" stroke="black" stroke-width="1"/>
    <text x="140" y="15" font-size="12" text-anchor="middle">S (Sample Space)</text>
    
    <circle cx="120" cy="100" r="70" fill="#90caf9" fill-opacity="0.6" stroke="blue" stroke-width="1"/>
    <text x="80" y="100" font-size="14" fill="blue">A</text>
    
    <circle cx="180" cy="100" r="70" fill="#ffcc80" fill-opacity="0.6" stroke="orange" stroke-width="1"/>
    <text x="220" y="100" font-size="14" fill="orange">B</text>
    
    <text x="150" y="100" font-size="14" fill="green">A∩B</text>
  </svg>
</div>

<h3>Combinatorics</h3>

<h4>Permutations:</h4>
<p>The number of ways to arrange n distinct objects in order:</p>
<p>P(n) = n!</p>
<p>The number of ways to arrange r objects from a set of n distinct objects:</p>
<p>P(n,r) = n! / (n-r)!</p>

<h4>Combinations:</h4>
<p>The number of ways to select r objects from a set of n distinct objects (order doesn't matter):</p>
<p>C(n,r) = n! / [r! × (n-r)!]</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Lottery Problem</h4>
  <p>In a lottery where you select 6 numbers from 49, the probability of winning is:</p>
  <p>P(winning) = 1 / C(49,6) = 1 / [49! / (6! × 43!)] = 1 / 13,983,816</p>
</div>

<h3>Probability Distributions</h3>

<h4>Discrete Probability Distributions:</h4>
<ul>
  <li><b>Binomial Distribution</b>: Models the number of successes in n independent trials with probability p</li>
  <li><b>Poisson Distribution</b>: Models the number of events occurring in a fixed interval</li>
</ul>

<h4>Continuous Probability Distributions:</h4>
<ul>
  <li><b>Normal Distribution</b>: The bell-shaped curve characterized by mean μ and standard deviation σ</li>
  <li><b>Uniform Distribution</b>: Equal probability across a continuous interval</li>
</ul>

<h3>Statistical Measures</h3>

<h4>Measures of Central Tendency:</h4>
<ul>
  <li><b>Mean (Average)</b>: The sum of all values divided by the number of values</li>
  <li><b>Median</b>: The middle value when data is arranged in order</li>
  <li><b>Mode</b>: The most frequently occurring value</li>
</ul>

<h4>Measures of Dispersion:</h4>
<ul>
  <li><b>Range</b>: The difference between the maximum and minimum values</li>
  <li><b>Variance</b>: The average of squared deviations from the mean</li>
  <li><b>Standard Deviation</b>: The square root of the variance</li>
</ul>

<h3>Bacalaureat Exam Tips</h3>
<ul>
  <li>Memorize the formulas for permutations and combinations</li>
  <li>Practice calculating probabilities using different approaches</li>
  <li>Understand when to apply the addition rule vs. the multiplication rule</li>
  <li>Know how to compute basic statistical measures from raw data</li>
  <li>Practice drawing and interpreting statistical graphs (histograms, box plots)</li>
</ul>`,
        order: 4,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("Mathematics")!.id,
        name: "Sequences and Series",
        description: "Understanding and working with mathematical sequences and series",
        content: `<h3>Introduction to Sequences</h3>
<p>A sequence is an ordered list of numbers following a pattern or rule. Each number in a sequence is called a term.</p>

<p>A sequence can be denoted as {a<sub>n</sub>}, where a<sub>n</sub> represents the nth term of the sequence.</p>

<h4>Types of Sequences:</h4>
<ul>
  <li><b>Finite sequence</b>: Has a fixed number of terms</li>
  <li><b>Infinite sequence</b>: Continues indefinitely</li>
</ul>

<h3>Arithmetic Sequences</h3>
<p>In an arithmetic sequence, the difference between consecutive terms is constant. This constant difference is called the common difference (d).</p>

<p><b>General formula</b>: a<sub>n</sub> = a<sub>1</sub> + (n - 1)d</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Arithmetic Sequence</h4>
  <p>For the arithmetic sequence {3, 7, 11, 15, 19, ...}:</p>
  <p>First term (a<sub>1</sub>) = 3</p>
  <p>Common difference (d) = 4</p>
  <p>To find the 10th term: a<sub>10</sub> = 3 + (10 - 1)4 = 3 + 36 = 39</p>
</div>

<div style="text-align: center; margin: 20px 0;">
  <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
    <!-- Number line -->
    <line x1="20" y1="75" x2="280" y2="75" stroke="black" stroke-width="1"/>
    
    <!-- Ticks and numbers -->
    <line x1="40" y1="70" x2="40" y2="80" stroke="black" stroke-width="1"/>
    <text x="38" y="90" font-size="12" text-anchor="middle">3</text>
    <circle cx="40" cy="75" r="4" fill="blue"/>
    
    <line x1="80" y1="70" x2="80" y2="80" stroke="black" stroke-width="1"/>
    <text x="78" y="90" font-size="12" text-anchor="middle">7</text>
    <circle cx="80" cy="75" r="4" fill="blue"/>
    
    <line x1="120" y1="70" x2="120" y2="80" stroke="black" stroke-width="1"/>
    <text x="118" y="90" font-size="12" text-anchor="middle">11</text>
    <circle cx="120" cy="75" r="4" fill="blue"/>
    
    <line x1="160" y1="70" x2="160" y2="80" stroke="black" stroke-width="1"/>
    <text x="158" y="90" font-size="12" text-anchor="middle">15</text>
    <circle cx="160" cy="75" r="4" fill="blue"/>
    
    <line x1="200" y1="70" x2="200" y2="80" stroke="black" stroke-width="1"/>
    <text x="198" y="90" font-size="12" text-anchor="middle">19</text>
    <circle cx="200" cy="75" r="4" fill="blue"/>
    
    <line x1="240" y1="70" x2="240" y2="80" stroke="black" stroke-width="1"/>
    <text x="238" y="90" font-size="12" text-anchor="middle">23</text>
    <circle cx="240" cy="75" r="4" fill="blue"/>
    
    <!-- Arrows showing common difference -->
    <path d="M 45,50 L 75,50" stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    <path d="M 85,50 L 115,50" stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    <path d="M 125,50 L 155,50" stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    <path d="M 165,50 L 195,50" stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    <path d="M 205,50 L 235,50" stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    
    <text x="60" y="40" font-size="12" fill="red">d=4</text>
    <text x="100" y="40" font-size="12" fill="red">d=4</text>
    <text x="140" y="40" font-size="12" fill="red">d=4</text>
    <text x="180" y="40" font-size="12" fill="red">d=4</text>
    <text x="220" y="40" font-size="12" fill="red">d=4</text>
    
    <!-- Arrow definition -->
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="red"/>
      </marker>
    </defs>
  </svg>
</div>

<h4>Sum of an Arithmetic Sequence:</h4>
<p>The sum of the first n terms of an arithmetic sequence is:</p>
<p>S<sub>n</sub> = n/2 × [2a<sub>1</sub> + (n - 1)d] = n/2 × (a<sub>1</sub> + a<sub>n</sub>)</p>

<h3>Geometric Sequences</h3>
<p>In a geometric sequence, the ratio between consecutive terms is constant. This constant ratio is called the common ratio (r).</p>

<p><b>General formula</b>: a<sub>n</sub> = a<sub>1</sub> × r<sup>n-1</sup></p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <h4>Example: Geometric Sequence</h4>
  <p>For the geometric sequence {2, 6, 18, 54, 162, ...}:</p>
  <p>First term (a<sub>1</sub>) = 2</p>
  <p>Common ratio (r) = 3</p>
  <p>To find the 7th term: a<sub>7</sub> = 2 × 3<sup>7-1</sup> = 2 × 3<sup>6</sup> = 2 × 729 = 1458</p>
</div>

<h4>Sum of a Geometric Sequence:</h4>
<p>The sum of the first n terms of a geometric sequence is:</p>
<p>S<sub>n</sub> = a<sub>1</sub> × (1 - r<sup>n</sup>) / (1 - r), for r ≠ 1</p>

<h4>Sum of an Infinite Geometric Sequence:</h4>
<p>If |r| < 1, the sum of an infinite geometric sequence is:</p>
<p>S<sub>∞</sub> = a<sub>1</sub> / (1 - r)</p>

<h3>Arithmetic-Geometric Sequences</h3>
<p>These are sequences where the terms form an arithmetic progression of geometric sequences or a geometric progression of arithmetic sequences.</p>

<h3>Fibonacci Sequence</h3>
<p>A special sequence where each term is the sum of the two preceding ones, starting from 0 and 1.</p>
<p>{0, 1, 1, 2, 3, 5, 8, 13, 21, ...}</p>

<p><b>Recurrence relation</b>: F<sub>n</sub> = F<sub>n-1</sub> + F<sub>n-2</sub>, where F<sub>0</sub> = 0 and F<sub>1</sub> = 1</p>

<h3>Recursive Sequences</h3>
<p>Sequences defined by specifying the first few terms and a recurrence relation that determines subsequent terms.</p>

<h3>Applications of Sequences and Series</h3>
<ul>
  <li><b>Financial mathematics</b>: Compound interest, loan payments, annuities</li>
  <li><b>Physics</b>: Motion, wave patterns, growth and decay</li>
  <li><b>Computer science</b>: Algorithm analysis, data structures</li>
  <li><b>Biology</b>: Population growth, cell division</li>
</ul>

<h3>Bacalaureat Exam Tips</h3>
<ul>
  <li>Memorize the formulas for arithmetic and geometric sequences</li>
  <li>Practice identifying the type of sequence and finding the common difference or ratio</li>
  <li>Learn to derive the formula for a sequence from given terms</li>
  <li>Understand when and how to apply the sum formulas</li>
  <li>Be comfortable with recursive definitions and generating terms</li>
</ul>`,
        order: 5,
        difficulty: "hard"
      }
    ];
    
    // English topics
    const englishTopics: InsertTopic[] = [
      {
        subjectId: subjectMap.get("English")!.id,
        name: "English Grammar - Tenses",
        description: "Overview of English verb tenses and their usage",
        content: "<p>English has 12 major tenses, each expressing different aspects of time.</p><p>Present tenses include:</p><ul><li><b>Simple Present</b>: Used for habits, general truths (e.g., \"I study English.\")</li><li><b>Present Continuous</b>: Used for actions happening now (e.g., \"I am studying English.\")</li><li><b>Present Perfect</b>: Used for past actions with current relevance (e.g., \"I have studied English.\")</li><li><b>Present Perfect Continuous</b>: Used for ongoing actions that started in the past (e.g., \"I have been studying English.\")</li></ul><p>Similar patterns exist for past and future tenses.</p>",
        order: 1,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("English")!.id,
        name: "Essay Writing Skills",
        description: "Techniques for effective essay writing in English",
        content: "<p>A well-structured essay typically consists of three main parts:</p><ul><li><b>Introduction</b>: Presents the topic and thesis statement</li><li><b>Body Paragraphs</b>: Each paragraph develops one main idea with evidence</li><li><b>Conclusion</b>: Summarizes the main points and restates the thesis</li></ul><p>Key writing techniques include:</p><ul><li>Using topic sentences to begin paragraphs</li><li>Incorporating evidence and examples to support claims</li><li>Using transitions to connect ideas</li><li>Varying sentence structure for better flow</li></ul>",
        order: 2,
        difficulty: "hard"
      },
      {
        subjectId: subjectMap.get("English")!.id,
        name: "Reading Comprehension Strategies",
        description: "Techniques for understanding and analyzing English texts",
        content: "<p>Effective reading comprehension involves several strategies:</p><ul><li><b>Skimming</b>: Quickly reading to get the main idea</li><li><b>Scanning</b>: Looking for specific information</li><li><b>Predicting</b>: Using context clues to anticipate content</li><li><b>Questioning</b>: Asking questions about the text</li><li><b>Summarizing</b>: Identifying key points</li></ul><p>When analyzing literary texts, pay attention to:</p><ul><li>Plot development</li><li>Character motivation</li><li>Setting and its significance</li><li>Themes and messages</li><li>Literary devices like metaphor and symbolism</li></ul>",
        order: 3,
        difficulty: "medium"
      }
    ];
    
    // Biology topics
    const biologyTopics: InsertTopic[] = [
      {
        subjectId: subjectMap.get("Biology")!.id,
        name: "Cell Structure and Function",
        description: "Study of cellular components and their roles",
        content: "<p>The cell is the basic structural and functional unit of all living organisms. There are two main types of cells:</p><ul><li><b>Prokaryotic cells</b>: Simpler, lack a nucleus (e.g., bacteria)</li><li><b>Eukaryotic cells</b>: More complex, have a nucleus (e.g., animal and plant cells)</li></ul><p>Key cell organelles and their functions include:</p><ul><li><b>Nucleus</b>: Contains genetic material and controls cellular activities</li><li><b>Mitochondria</b>: Produce energy through cellular respiration</li><li><b>Endoplasmic Reticulum</b>: Involved in protein synthesis and lipid metabolism</li><li><b>Golgi Apparatus</b>: Processes and packages proteins</li><li><b>Lysosomes</b>: Contain digestive enzymes for breaking down waste</li></ul>",
        order: 1,
        difficulty: "medium"
      },
      {
        subjectId: subjectMap.get("Biology")!.id,
        name: "Human Circulatory System",
        description: "Overview of the heart, blood vessels, and blood circulation",
        content: "<p>The circulatory system is responsible for transporting nutrients, oxygen, carbon dioxide, and hormones throughout the body.</p><p>The main components include:</p><ul><li><b>Heart</b>: A four-chambered pump that propels blood</li><li><b>Blood vessels</b>: Arteries (carry blood away from the heart), veins (carry blood to the heart), and capillaries (exchange sites)</li><li><b>Blood</b>: Composed of plasma, red blood cells, white blood cells, and platelets</li></ul><p>Blood circulation follows two paths:</p><ul><li><b>Pulmonary circulation</b>: Blood flows between the heart and lungs for oxygenation</li><li><b>Systemic circulation</b>: Blood flows between the heart and the rest of the body</li></ul>",
        order: 2,
        difficulty: "hard"
      },
      {
        subjectId: subjectMap.get("Biology")!.id,
        name: "Genetics and Inheritance",
        description: "Principles of genetic inheritance and DNA structure",
        content: "<p>Genetics is the study of genes, heredity, and genetic variation in living organisms.</p><p>Key concepts include:</p><ul><li><b>DNA Structure</b>: Double helix composed of nucleotides containing adenine, thymine, guanine, and cytosine</li><li><b>Genes</b>: Segments of DNA that code for specific proteins</li><li><b>Chromosomes</b>: Structures that contain DNA and proteins</li><li><b>Mendel's Laws</b>: Law of segregation and law of independent assortment</li></ul><p>Inheritance patterns include:</p><ul><li><b>Dominant/Recessive</b>: Some traits mask others when present</li><li><b>Codominance</b>: Both alleles are expressed simultaneously</li><li><b>Sex-linked</b>: Traits carried on sex chromosomes</li></ul>",
        order: 3,
        difficulty: "hard"
      }
    ];
    
    // Add all topics to the topics map
    const allTopics = [...romanianTopics, ...mathTopics, ...englishTopics, ...biologyTopics];
    
    for (const topicData of allTopics) {
      const id = this.topicId++;
      const topic: Topic = {
        id,
        subjectId: topicData.subjectId,
        name: topicData.name,
        description: topicData.description,
        content: topicData.content,
        order: topicData.order,
        difficulty: topicData.difficulty || null
      };
      this.topics.set(id, topic);
    }

    // Create user progress for each subject
    const progressData: InsertUserProgress[] = [
      {
        userId: user.id,
        subjectId: subjectMap.get("Romanian")!.id,
        topicsCompleted: 12,
        lastStudied: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        percentComplete: 74
      },
      {
        userId: user.id,
        subjectId: subjectMap.get("Mathematics")!.id,
        topicsCompleted: 8,
        lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        percentComplete: 58
      },
      {
        userId: user.id,
        subjectId: subjectMap.get("English")!.id,
        topicsCompleted: 14,
        lastStudied: new Date(), // Today
        percentComplete: 89
      },
      {
        userId: user.id,
        subjectId: subjectMap.get("Biology")!.id,
        topicsCompleted: 6,
        lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        percentComplete: 35
      }
    ];

    for (const data of progressData) {
      const id = this.progressId++;
      const progress: UserProgress = {
        id,
        userId: data.userId,
        subjectId: data.subjectId,
        topicsCompleted: data.topicsCompleted ?? 0,
        lastStudied: data.lastStudied ?? new Date(),
        percentComplete: data.percentComplete ?? 0
      };
      this.userProgress.set(id, progress);
    }

    // Create sample tests
    const testData: InsertTest[] = [
      {
        name: "Romanian Literature Quiz",
        subjectId: subjectMap.get("Romanian")!.id,
        description: "Test your knowledge of Romanian literature classics",
        questions: JSON.parse(`[
          {
            "question": "Who wrote the novel 'Ion'?",
            "options": ["Liviu Rebreanu", "Mihail Sadoveanu", "Camil Petrescu", "George Călinescu"],
            "correctAnswer": 0,
            "explanation": "Liviu Rebreanu wrote 'Ion' in 1920, a novel that depicts rural life in Transylvania."
          },
          {
            "question": "Which of the following is NOT a work by Mihai Eminescu?",
            "options": ["Luceafărul", "Floare Albastră", "Plumb", "Scrisoarea I"],
            "correctAnswer": 2,
            "explanation": "'Plumb' was written by George Bacovia, not Mihai Eminescu."
          }
        ]`),
        timeLimit: 20,
        difficulty: "medium"
      },
      {
        name: "Mathematics Practice Exam",
        subjectId: subjectMap.get("Mathematics")!.id,
        description: "Comprehensive practice exam covering algebra and geometry",
        questions: JSON.parse(`[
          {
            "question": "Solve for x: 2x + 5 = 13",
            "options": ["x = 3", "x = 4", "x = 5", "x = 6"],
            "correctAnswer": 1,
            "explanation": "2x + 5 = 13, 2x = 8, x = 4"
          },
          {
            "question": "What is the formula for the area of a circle?",
            "options": ["A = πr²", "A = 2πr", "A = πd", "A = 4πr²"],
            "correctAnswer": 0,
            "explanation": "The area of a circle is π multiplied by the square of the radius (πr²)."
          }
        ]`),
        timeLimit: 60,
        difficulty: "hard"
      },
      {
        name: "English Grammar Test",
        subjectId: subjectMap.get("English")!.id,
        description: "Test your knowledge of English grammar rules",
        questions: JSON.parse(`[
          {
            "question": "Which sentence uses the correct form of the verb?",
            "options": ["She don't know the answer.", "She doesn't knows the answer.", "She doesn't know the answer.", "She not know the answer."],
            "correctAnswer": 2,
            "explanation": "For third-person singular in present simple negative, we use 'doesn't' + base form of the verb."
          },
          {
            "question": "Choose the correct preposition: 'I'm afraid ___ spiders.'",
            "options": ["from", "of", "about", "for"],
            "correctAnswer": 1,
            "explanation": "The correct phrase is 'afraid of' something."
          }
        ]`),
        timeLimit: 30,
        difficulty: "easy"
      }
    ];

    for (const data of testData) {
      const id = this.testId++;
      const test: Test = { ...data, id };
      this.tests.set(id, test);
    }

    // Create sample test results
    const now = new Date();
    const testResults: InsertUserTestResult[] = [
      {
        userId: user.id,
        testId: 1, // Romanian Literature Quiz
        score: 17,
        percentCorrect: 85,
        answers: [
          { questionIndex: 0, selectedOption: 0, correct: true },
          { questionIndex: 1, selectedOption: 2, correct: true }
        ]
      },
      {
        userId: user.id,
        testId: 2, // Mathematics Practice Exam
        score: 68,
        percentCorrect: 68,
        answers: [
          { questionIndex: 0, selectedOption: 1, correct: true },
          { questionIndex: 1, selectedOption: 2, correct: false }
        ]
      },
      {
        userId: user.id,
        testId: 3, // English Grammar Test
        score: 92,
        percentCorrect: 92,
        answers: [
          { questionIndex: 0, selectedOption: 2, correct: true },
          { questionIndex: 1, selectedOption: 1, correct: true }
        ]
      }
    ];

    for (let i = 0; i < testResults.length; i++) {
      const data = testResults[i];
      const id = this.testResultId++;
      const completedAt = new Date(now.getTime() - (i + 1) * 2 * 24 * 60 * 60 * 1000);
      const result: UserTestResult = { ...data, id, completedAt };
      this.userTestResults.set(id, result);
    }

    // Create badges
    const badgeData: InsertBadge[] = [
      {
        name: "Math Wizard",
        description: "Achieved 90% or higher on 3 math quizzes",
        icon: "ri-medal-line",
        criteria: "math_quiz_90"
      },
      {
        name: "Literature Pro",
        description: "Completed all literature topics",
        icon: "ri-book-mark-line",
        criteria: "literature_complete"
      },
      {
        name: "Speed Demon",
        description: "Completed a test in half the allotted time",
        icon: "ri-timer-line",
        criteria: "fast_test"
      }
    ];

    for (const data of badgeData) {
      const id = this.badgeId++;
      const badge: Badge = { ...data, id };
      this.badges.set(id, badge);
    }

    // Assign badges to the user
    for (let i = 1; i <= 3; i++) {
      const id = this.userBadgeId++;
      const userBadge: UserBadge = {
        id,
        userId: user.id,
        badgeId: i,
        earnedAt: new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000)
      };
      this.userBadges.set(id, userBadge);
    }

    // Create study streaks for the last week
    for (let i = 0; i < 3; i++) { // Only 3 days of streak (Mon, Tue, Wed)
      const id = this.streakId++;
      const streak: StudyStreak = {
        id,
        userId: user.id,
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000), // Starting from 6 days ago
        minutesStudied: 45 + i * 15 // Increasing study time each day
      };
      this.studyStreaks.set(id, streak);
    }

    // Create study plan tasks
    const taskData: InsertStudyPlanTask[] = [
      {
        userId: user.id,
        title: "Complete Mathematics lesson on Geometric Progressions",
        description: "25 min - Continue from where you left off",
        duration: 25,
        priority: true,
        recommended: false,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        userId: user.id,
        title: "Practice Romanian Literary Analysis exercise",
        description: "40 min - Focus on character development in \"Ion\"",
        duration: 40,
        priority: false,
        recommended: false,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        userId: user.id,
        title: "Review English vocabulary flashcards",
        description: "15 min - Focus on academic vocabulary",
        duration: 15,
        priority: false,
        recommended: false,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        userId: user.id,
        title: "Try a short Biology quiz on Cell Structure",
        description: "20 min - This is your weakest topic",
        duration: 20,
        priority: false,
        recommended: true,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      }
    ];

    for (const data of taskData) {
      const id = this.taskId++;
      const task: StudyPlanTask = {
        id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        duration: data.duration,
        priority: data.priority ?? false,
        recommended: data.recommended ?? false,
        completed: false,
        dueDate: data.dueDate ?? new Date()
      };
      this.studyPlanTasks.set(id, task);
    }

    // Create AI chat history
    const chatHistory: InsertAiChatHistory = {
      userId: user.id,
      messages: [
        {
          content: "Hello! I'm your AI learning assistant. How can I help with your Bacalaureat preparation today?",
          isUser: false
        },
        {
          content: "Can you explain the formula for geometric progressions?",
          isUser: true
        },
        {
          content: "In a geometric progression with first term a and common ratio r, the nth term is given by: an = a1 × r^(n-1)\n\nThe sum of the first n terms is:\nSn = a1 × (1 - r^n) / (1 - r) when r ≠ 1\n\nWould you like to see an example or practice problems?",
          isUser: false
        }
      ]
    };

    const id = this.chatHistoryId++;
    const now2 = new Date();
    const history: AiChatHistory = {
      ...chatHistory,
      id,
      createdAt: now2,
      updatedAt: now2
    };
    this.aiChatHistory.set(id, history);
  }
}

export const storage = new MemStorage();
