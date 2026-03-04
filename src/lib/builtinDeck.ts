import type { Deck, FullCard } from "./types";

const cards: FullCard[] = [
  // ── JAVA ──────────────────────────────────────────────────────────────────
  {
    id: "java-1",
    type: "full",
    category: "java",
    question: "What is the difference between <code>==</code> and <code>.equals()</code> in Java?",
    front: "What is the difference between <code>==</code> and <code>.equals()</code> in Java?",
    options: [
      "They are the same thing",
      "<code>==</code> compares object references; <code>.equals()</code> compares content/value",
      "<code>==</code> compares content; <code>.equals()</code> compares references",
      "<code>.equals()</code> only works on primitives",
    ],
    answerIndex: 1,
    explanation:
      "<code>==</code> checks if two variables point to the <strong>same object in memory</strong>. <code>.equals()</code> checks if two objects have the <strong>same value</strong>. So <code>new String(\"hi\") == new String(\"hi\")</code> is <strong>false</strong> (different objects), but <code>.equals()</code> returns <strong>true</strong> (same content). Always use <code>.equals()</code> when comparing Strings.",
    back: "<code>==</code> checks if two variables point to the <strong>same object in memory</strong>. <code>.equals()</code> checks if two objects have the <strong>same value</strong>. So <code>new String(\"hi\") == new String(\"hi\")</code> is <strong>false</strong> (different objects), but <code>.equals()</code> returns <strong>true</strong> (same content). Always use <code>.equals()</code> when comparing Strings.",
  },
  {
    id: "java-2",
    type: "full",
    category: "java",
    question: "What does the <code>final</code> keyword do when applied to a variable?",
    front: "What does the <code>final</code> keyword do when applied to a variable?",
    options: [
      "Makes the variable private",
      "Makes the variable static",
      "Prevents the variable from being reassigned after initialization",
      "Deletes the variable after use",
    ],
    answerIndex: 2,
    explanation:
      "<code>final</code> means the variable can only be assigned <strong>once</strong>. For primitives, the value can't change. For objects, the <strong>reference</strong> can't change (but the object's internal state still can). Think of it like a constant — <code>final int MAX = 100</code> means MAX is always 100.",
    back: "<code>final</code> means the variable can only be assigned <strong>once</strong>. For primitives, the value can't change. For objects, the <strong>reference</strong> can't change (but the object's internal state still can). Think of it like a constant — <code>final int MAX = 100</code> means MAX is always 100.",
  },
  {
    id: "java-3",
    type: "full",
    category: "java",
    question: "What is the difference between an <code>interface</code> and an <code>abstract class</code>?",
    front: "What is the difference between an <code>interface</code> and an <code>abstract class</code>?",
    options: [
      "There is no difference",
      "An abstract class can have constructors and state; an interface defines a contract with no state (before Java 8)",
      "An interface can be instantiated; an abstract class cannot",
      "Abstract classes support multiple inheritance; interfaces do not",
    ],
    answerIndex: 1,
    explanation:
      "An <strong>abstract class</strong> can have fields, constructors, and concrete methods — it's a partial implementation. An <strong>interface</strong> is a pure contract (what to do, not how). A class can only extend <strong>one</strong> abstract class but implement <strong>multiple</strong> interfaces. Since Java 8, interfaces can have <code>default</code> methods too.",
    back: "An <strong>abstract class</strong> can have fields, constructors, and concrete methods — it's a partial implementation. An <strong>interface</strong> is a pure contract (what to do, not how). A class can only extend <strong>one</strong> abstract class but implement <strong>multiple</strong> interfaces. Since Java 8, interfaces can have <code>default</code> methods too.",
  },
  {
    id: "java-4",
    type: "full",
    category: "java",
    question: "What does <code>HashMap.get(key)</code> return if the key doesn't exist?",
    front: "What does <code>HashMap.get(key)</code> return if the key doesn't exist?",
    options: [
      "0",
      "An empty string",
      "<code>null</code>",
      "It throws a NullPointerException",
    ],
    answerIndex: 2,
    explanation:
      "If a key doesn't exist in a HashMap, <code>.get()</code> returns <code>null</code>. This is important — always check <code>map.containsKey(key)</code> or handle nulls before using the result, otherwise you'll get a <code>NullPointerException</code> when you try to use it.",
    back: "If a key doesn't exist in a HashMap, <code>.get()</code> returns <code>null</code>. This is important — always check <code>map.containsKey(key)</code> or handle nulls before using the result, otherwise you'll get a <code>NullPointerException</code> when you try to use it.",
  },
  {
    id: "java-5",
    type: "full",
    category: "java",
    question: "What is the difference between a checked and unchecked exception?",
    front: "What is the difference between a checked and unchecked exception?",
    options: [
      "Checked exceptions extend RuntimeException; unchecked do not",
      "Checked exceptions must be caught or declared with throws; unchecked exceptions don't have to be",
      "Unchecked exceptions crash the program; checked exceptions don't",
      "There is no real difference",
    ],
    answerIndex: 1,
    explanation:
      "<strong>Checked exceptions</strong> (like <code>IOException</code>, <code>SQLException</code>) are compile-time — the compiler forces you to handle them. <strong>Unchecked exceptions</strong> (like <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>) extend <code>RuntimeException</code> and don't need to be explicitly caught — they usually indicate programming bugs.",
    back: "<strong>Checked exceptions</strong> (like <code>IOException</code>, <code>SQLException</code>) are compile-time — the compiler forces you to handle them. <strong>Unchecked exceptions</strong> (like <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>) extend <code>RuntimeException</code> and don't need to be explicitly caught — they usually indicate programming bugs.",
  },
  {
    id: "java-6",
    type: "full",
    category: "java",
    question: "What is method overloading vs method overriding?",
    front: "What is method overloading vs method overriding?",
    options: [
      "Overloading is in the same class with different parameters; overriding is in a subclass redefining a parent method",
      "Overriding is in the same class; overloading is in a subclass",
      "They mean the same thing",
      "Overloading requires the <code>@Override</code> annotation",
    ],
    answerIndex: 0,
    explanation:
      "<strong>Overloading</strong> = same method name, different parameter list, in the <strong>same class</strong>. Example: <code>add(int a)</code> and <code>add(int a, int b)</code>. <strong>Overriding</strong> = a subclass provides its own implementation of a method inherited from the parent. Uses <code>@Override</code> annotation. Overloading is compile-time polymorphism; overriding is runtime polymorphism.",
    back: "<strong>Overloading</strong> = same method name, different parameter list, in the <strong>same class</strong>. Example: <code>add(int a)</code> and <code>add(int a, int b)</code>. <strong>Overriding</strong> = a subclass provides its own implementation of a method inherited from the parent. Uses <code>@Override</code> annotation. Overloading is compile-time polymorphism; overriding is runtime polymorphism.",
  },
  {
    id: "java-7",
    type: "full",
    category: "java",
    question: "What do access modifiers <code>public</code>, <code>private</code>, and <code>protected</code> control?",
    front: "What do access modifiers <code>public</code>, <code>private</code>, and <code>protected</code> control?",
    options: [
      "The speed of the method",
      "Whether the method can be overridden",
      "Who can access the class member from other classes/packages",
      "Whether the method runs on the main thread",
    ],
    answerIndex: 2,
    explanation:
      "<code>public</code> = accessible from anywhere. <code>private</code> = only within the same class. <code>protected</code> = same class + subclasses + same package. Default (no modifier) = same package only. This is <strong>encapsulation</strong> — controlling what parts of your code are exposed.",
    back: "<code>public</code> = accessible from anywhere. <code>private</code> = only within the same class. <code>protected</code> = same class + subclasses + same package. Default (no modifier) = same package only. This is <strong>encapsulation</strong> — controlling what parts of your code are exposed.",
  },

  // ── SPRING ────────────────────────────────────────────────────────────────
  {
    id: "spring-1",
    type: "full",
    category: "spring",
    question: "What does <code>@Autowired</code> do in Spring?",
    front: "What does <code>@Autowired</code> do in Spring?",
    options: [
      "It marks a class as a REST controller",
      "It tells Spring to automatically inject a dependency into the field or constructor",
      "It creates a new database connection",
      "It maps a URL to a method",
    ],
    answerIndex: 1,
    explanation:
      "<code>@Autowired</code> is Spring's dependency injection annotation. Instead of manually creating objects with <code>new</code>, Spring looks at its container of Beans and automatically provides (injects) the right one. Best practice is to use <strong>constructor injection</strong> over field injection for testability.",
    back: "<code>@Autowired</code> is Spring's dependency injection annotation. Instead of manually creating objects with <code>new</code>, Spring looks at its container of Beans and automatically provides (injects) the right one. Best practice is to use <strong>constructor injection</strong> over field injection for testability.",
  },
  {
    id: "spring-2",
    type: "full",
    category: "spring",
    question: "What is the difference between <code>@Controller</code> and <code>@RestController</code>?",
    front: "What is the difference between <code>@Controller</code> and <code>@RestController</code>?",
    options: [
      "They are identical",
      "<code>@RestController</code> = <code>@Controller</code> + <code>@ResponseBody</code>; automatically serializes return values to JSON",
      "<code>@Controller</code> is for REST APIs; <code>@RestController</code> is for web pages",
      "<code>@RestController</code> requires a database connection",
    ],
    answerIndex: 1,
    explanation:
      "<code>@Controller</code> is used for MVC web apps — it returns view names (like HTML templates). <code>@RestController</code> combines <code>@Controller</code> and <code>@ResponseBody</code>, meaning every method automatically serializes its return value to JSON. For REST APIs, you always use <code>@RestController</code>.",
    back: "<code>@Controller</code> is used for MVC web apps — it returns view names (like HTML templates). <code>@RestController</code> combines <code>@Controller</code> and <code>@ResponseBody</code>, meaning every method automatically serializes its return value to JSON. For REST APIs, you always use <code>@RestController</code>.",
  },
  {
    id: "spring-3",
    type: "full",
    category: "spring",
    question: "What is the purpose of <code>@Transactional</code> in Spring?",
    front: "What is the purpose of <code>@Transactional</code> in Spring?",
    options: [
      "It secures the endpoint with authentication",
      "It wraps a method in a database transaction — if anything fails, all changes are rolled back",
      "It caches the result of the method",
      "It makes the method run asynchronously",
    ],
    answerIndex: 1,
    explanation:
      "<code>@Transactional</code> ensures that all database operations in a method succeed together or fail together (atomicity). If an exception is thrown midway, Spring automatically <strong>rolls back</strong> all changes made in that transaction. Critical for data integrity — e.g., transferring money between accounts.",
    back: "<code>@Transactional</code> ensures that all database operations in a method succeed together or fail together (atomicity). If an exception is thrown midway, Spring automatically <strong>rolls back</strong> all changes made in that transaction. Critical for data integrity — e.g., transferring money between accounts.",
  },
  {
    id: "spring-4",
    type: "full",
    category: "spring",
    question: "What is the difference between <code>@Component</code>, <code>@Service</code>, and <code>@Repository</code>?",
    front: "What is the difference between <code>@Component</code>, <code>@Service</code>, and <code>@Repository</code>?",
    options: [
      "They are completely different annotations with different behaviors",
      "They all register a class as a Spring Bean; the difference is semantic/layer-specific",
      "<code>@Service</code> is faster than <code>@Component</code>",
      "<code>@Repository</code> is only for MongoDB",
    ],
    answerIndex: 1,
    explanation:
      "All three register the class as a <strong>Spring Bean</strong> (managed by Spring). The difference is just semantic — they tell developers which layer the class belongs to: <code>@Component</code> = generic, <code>@Service</code> = business logic layer, <code>@Repository</code> = data access layer. <code>@Repository</code> also adds exception translation for database errors.",
    back: "All three register the class as a <strong>Spring Bean</strong> (managed by Spring). The difference is just semantic — they tell developers which layer the class belongs to: <code>@Component</code> = generic, <code>@Service</code> = business logic layer, <code>@Repository</code> = data access layer. <code>@Repository</code> also adds exception translation for database errors.",
  },
  {
    id: "spring-5",
    type: "full",
    category: "spring",
    question: "What is IoC (Inversion of Control) in Spring?",
    front: "What is IoC (Inversion of Control) in Spring?",
    options: [
      "A security protocol",
      "Instead of your code creating dependencies, you give control to Spring to create and inject them",
      "A way to reverse a string in Java",
      "A method for handling HTTP requests in reverse order",
    ],
    answerIndex: 1,
    explanation:
      "Normally YOU control object creation: <code>UserService s = new UserService()</code>. With IoC, you <strong>invert</strong> that control — you just declare what you need, and Spring creates and manages it for you. This makes code more modular and testable. Dependency Injection (DI) is the mechanism Spring uses to implement IoC.",
    back: "Normally YOU control object creation: <code>UserService s = new UserService()</code>. With IoC, you <strong>invert</strong> that control — you just declare what you need, and Spring creates and manages it for you. This makes code more modular and testable. Dependency Injection (DI) is the mechanism Spring uses to implement IoC.",
  },

  // ── JPA / JDBC ────────────────────────────────────────────────────────────
  {
    id: "jpa-1",
    type: "full",
    category: "jpa",
    question: "What is the main difference between JDBC and JPA?",
    front: "What is the main difference between JDBC and JPA?",
    options: [
      "JDBC is newer than JPA",
      "JDBC requires you to write raw SQL manually; JPA maps Java objects to tables and generates SQL for you",
      "JPA only works with NoSQL databases",
      "They do the same thing",
    ],
    answerIndex: 1,
    explanation:
      "<strong>JDBC</strong> is low-level — you write raw SQL, manage connections, and process ResultSets yourself. <strong>JPA</strong> is a higher-level ORM (Object-Relational Mapping) spec — you annotate Java classes and JPA handles the SQL. Hibernate is the most common JPA implementation. Think of it as: JDBC = manual, JPA = automatic.",
    back: "<strong>JDBC</strong> is low-level — you write raw SQL, manage connections, and process ResultSets yourself. <strong>JPA</strong> is a higher-level ORM (Object-Relational Mapping) spec — you annotate Java classes and JPA handles the SQL. Hibernate is the most common JPA implementation. Think of it as: JDBC = manual, JPA = automatic.",
  },
  {
    id: "jpa-2",
    type: "full",
    category: "jpa",
    question: "What does the <code>@Entity</code> annotation do in JPA?",
    front: "What does the <code>@Entity</code> annotation do in JPA?",
    options: [
      "It marks a class as a Spring Bean",
      "It marks a Java class as a database table — each instance represents a row",
      "It creates a REST endpoint",
      "It defines a business service",
    ],
    answerIndex: 1,
    explanation:
      "<code>@Entity</code> tells JPA that this Java class maps to a database table. Each field (annotated with <code>@Column</code>) maps to a column, and each instance of the class represents a row. You also need <code>@Id</code> to mark the primary key field.",
    back: "<code>@Entity</code> tells JPA that this Java class maps to a database table. Each field (annotated with <code>@Column</code>) maps to a column, and each instance of the class represents a row. You also need <code>@Id</code> to mark the primary key field.",
  },
  {
    id: "jpa-3",
    type: "full",
    category: "jpa",
    question: "What is lazy loading vs eager loading in JPA?",
    front: "What is lazy loading vs eager loading in JPA?",
    options: [
      "Lazy = loads all data immediately; Eager = loads data on demand",
      "Lazy = loads related data only when accessed; Eager = loads related data immediately with the parent",
      "They refer to how fast the database query runs",
      "Lazy loading is only for lists; eager loading is only for single objects",
    ],
    answerIndex: 1,
    explanation:
      "<strong>Lazy loading</strong>: related entities are fetched from the database <strong>only when you actually access them</strong>. Better for performance when you don't always need related data. <strong>Eager loading</strong>: related entities are fetched <strong>immediately</strong> along with the parent. Use eager when you always need the related data. Default: <code>@ManyToOne</code> is EAGER, <code>@OneToMany</code> is LAZY.",
    back: "<strong>Lazy loading</strong>: related entities are fetched from the database <strong>only when you actually access them</strong>. Better for performance when you don't always need related data. <strong>Eager loading</strong>: related entities are fetched <strong>immediately</strong> along with the parent. Use eager when you always need the related data. Default: <code>@ManyToOne</code> is EAGER, <code>@OneToMany</code> is LAZY.",
  },

  // ── DEVSECOPS ─────────────────────────────────────────────────────────────
  {
    id: "devsecops-1",
    type: "full",
    category: "devsecops",
    question: "What does CI stand for and what is its main purpose?",
    front: "What does CI stand for and what is its main purpose?",
    options: [
      "Continuous Isolation — keeping environments separate",
      "Continuous Integration — automatically building and testing code on every push",
      "Code Inspection — manually reviewing code",
      "Container Infrastructure — managing Docker containers",
    ],
    answerIndex: 1,
    explanation:
      "<strong>Continuous Integration</strong> means every time a developer pushes code, an automated pipeline runs: build → test → lint. The goal is to catch bugs <strong>early and often</strong>, before they pile up. Tools: GitHub Actions, Jenkins, GitLab CI. The pipeline fails fast so developers fix issues immediately.",
    back: "<strong>Continuous Integration</strong> means every time a developer pushes code, an automated pipeline runs: build → test → lint. The goal is to catch bugs <strong>early and often</strong>, before they pile up. Tools: GitHub Actions, Jenkins, GitLab CI. The pipeline fails fast so developers fix issues immediately.",
  },
  {
    id: "devsecops-2",
    type: "full",
    category: "devsecops",
    question: "What is the difference between a Docker image and a Docker container?",
    front: "What is the difference between a Docker image and a Docker container?",
    options: [
      "They are the same thing",
      "An image is the blueprint/template; a container is a running instance of that image",
      "A container is the blueprint; an image is the running instance",
      "Images run on Linux only; containers run on any OS",
    ],
    answerIndex: 1,
    explanation:
      "Think of it like a class vs an object. A <strong>Docker image</strong> is the blueprint — a read-only snapshot of your app and its dependencies. A <strong>container</strong> is a live, running instance of that image. You can run multiple containers from the same image. <code>docker build</code> creates an image, <code>docker run</code> starts a container from it.",
    back: "Think of it like a class vs an object. A <strong>Docker image</strong> is the blueprint — a read-only snapshot of your app and its dependencies. A <strong>container</strong> is a live, running instance of that image. You can run multiple containers from the same image. <code>docker build</code> creates an image, <code>docker run</code> starts a container from it.",
  },
  {
    id: "devsecops-3",
    type: "full",
    category: "devsecops",
    question: "What is <code>git rebase</code> vs <code>git merge</code>?",
    front: "What is <code>git rebase</code> vs <code>git merge</code>?",
    options: [
      "They do the same thing",
      "Merge creates a merge commit preserving history; rebase rewrites history by replaying commits on top of another branch",
      "Rebase is safer than merge",
      "Merge only works on the main branch",
    ],
    answerIndex: 1,
    explanation:
      "<strong>Merge</strong> combines two branches and creates a new merge commit — history is preserved as-is, showing the branch structure. <strong>Rebase</strong> moves your commits to the tip of another branch, rewriting history for a cleaner linear log. Rule of thumb: merge for shared/public branches, rebase for local cleanup before a PR.",
    back: "<strong>Merge</strong> combines two branches and creates a new merge commit — history is preserved as-is, showing the branch structure. <strong>Rebase</strong> moves your commits to the tip of another branch, rewriting history for a cleaner linear log. Rule of thumb: merge for shared/public branches, rebase for local cleanup before a PR.",
  },
  {
    id: "devsecops-4",
    type: "full",
    category: "devsecops",
    question: "What is a Kubernetes Pod?",
    front: "What is a Kubernetes Pod?",
    options: [
      "A Kubernetes cluster",
      "The smallest deployable unit in Kubernetes — wraps one or more containers that share network and storage",
      "A type of Docker image",
      "A CI/CD pipeline step",
    ],
    answerIndex: 1,
    explanation:
      "A <strong>Pod</strong> is the smallest unit you deploy in Kubernetes. It wraps one or more containers that share the same network (IP address) and storage. Usually one container per pod. Kubernetes manages pods — restarting them if they crash, scaling them up/down, distributing them across nodes.",
    back: "A <strong>Pod</strong> is the smallest unit you deploy in Kubernetes. It wraps one or more containers that share the same network (IP address) and storage. Usually one container per pod. Kubernetes manages pods — restarting them if they crash, scaling them up/down, distributing them across nodes.",
  },
  {
    id: "devsecops-5",
    type: "full",
    category: "devsecops",
    question: "What is SAST in security automation?",
    front: "What is SAST in security automation?",
    options: [
      "A type of firewall",
      "Static Application Security Testing — scans source code for vulnerabilities without running it",
      "A cloud storage service",
      "A method for encrypting API keys",
    ],
    answerIndex: 1,
    explanation:
      "<strong>SAST (Static Application Security Testing)</strong> analyzes your source code or compiled code <strong>without executing it</strong>, looking for security vulnerabilities like SQL injection, hardcoded secrets, or buffer overflows. It's integrated into CI pipelines so issues are caught before deployment. Tools: SonarQube, Checkmarx. Compare with DAST which tests the <strong>running</strong> app.",
    back: "<strong>SAST (Static Application Security Testing)</strong> analyzes your source code or compiled code <strong>without executing it</strong>, looking for security vulnerabilities like SQL injection, hardcoded secrets, or buffer overflows. It's integrated into CI pipelines so issues are caught before deployment. Tools: SonarQube, Checkmarx. Compare with DAST which tests the <strong>running</strong> app.",
  },

  // ── CS FUNDAMENTALS ───────────────────────────────────────────────────────
  {
    id: "cs-1",
    type: "full",
    category: "cs",
    question: "What is the time complexity of a HashMap lookup?",
    front: "What is the time complexity of a HashMap lookup?",
    options: [
      "O(n)",
      "O(log n)",
      "O(1) — constant time on average",
      "O(n²)",
    ],
    answerIndex: 2,
    explanation:
      "HashMap uses a <strong>hash function</strong> to compute the index directly from the key — so lookup is O(1) on average, regardless of how many elements are in the map. Worst case is O(n) due to hash collisions, but a well-implemented HashMap keeps this rare. This is why HashMap is the go-to for fast lookups.",
    back: "HashMap uses a <strong>hash function</strong> to compute the index directly from the key — so lookup is O(1) on average, regardless of how many elements are in the map. Worst case is O(n) due to hash collisions, but a well-implemented HashMap keeps this rare. This is why HashMap is the go-to for fast lookups.",
  },
  {
    id: "cs-2",
    type: "full",
    category: "cs",
    question: "What is the difference between a Stack and a Queue?",
    front: "What is the difference between a Stack and a Queue?",
    options: [
      "They are the same structure",
      "Stack = LIFO (Last In First Out); Queue = FIFO (First In First Out)",
      "Stack = FIFO; Queue = LIFO",
      "Stacks are faster than queues",
    ],
    answerIndex: 1,
    explanation:
      "<strong>Stack</strong> = Last In, First Out — like a stack of plates, you add and remove from the top. Used for: undo history, bracket matching, recursion call stack. <strong>Queue</strong> = First In, First Out — like a line at a counter, first to arrive is first served. Used for: task scheduling, BFS traversal, message queues.",
    back: "<strong>Stack</strong> = Last In, First Out — like a stack of plates, you add and remove from the top. Used for: undo history, bracket matching, recursion call stack. <strong>Queue</strong> = First In, First Out — like a line at a counter, first to arrive is first served. Used for: task scheduling, BFS traversal, message queues.",
  },
  {
    id: "cs-3",
    type: "full",
    category: "cs",
    question: "What does SQL <code>INNER JOIN</code> return?",
    front: "What does SQL <code>INNER JOIN</code> return?",
    options: [
      "All rows from both tables",
      "All rows from the left table plus matching rows from the right",
      "Only rows where there is a match in BOTH tables",
      "Only rows from the right table",
    ],
    answerIndex: 2,
    explanation:
      "<strong>INNER JOIN</strong> returns only rows where the join condition is met in <strong>both</strong> tables — unmatched rows from either side are excluded. Compare: <code>LEFT JOIN</code> keeps all rows from the left table (with NULLs for unmatched right rows), <code>RIGHT JOIN</code> keeps all from the right, <code>FULL OUTER JOIN</code> keeps all from both.",
    back: "<strong>INNER JOIN</strong> returns only rows where the join condition is met in <strong>both</strong> tables — unmatched rows from either side are excluded. Compare: <code>LEFT JOIN</code> keeps all rows from the left table (with NULLs for unmatched right rows), <code>RIGHT JOIN</code> keeps all from the right, <code>FULL OUTER JOIN</code> keeps all from both.",
  },
];

export const builtinDeck: Deck = {
  id: "builtin-java-spring",
  name: "Java Interview Prep",
  description:
    "Core Java, Spring Boot, JPA/JDBC, DevSecOps, and CS fundamentals — 23 questions with full explanations.",
  createdAt: "2024-01-01T00:00:00.000Z",
  isBuiltIn: true,
  categories: ["java", "spring", "jpa", "devsecops", "cs"],
  cards,
};
