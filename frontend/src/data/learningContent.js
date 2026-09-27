export const LEARNING_TOPICS = [
  {
    category: "Fundamentals",
    topics: [
      {
        id: "variables",
        title: "Variables & data types",
        summary: "Names that hold values, and the built-in types Python uses to represent them.",
        explanation:
          "A variable is a name bound to a value in memory. Python is dynamically typed, so you don't declare a type — it's inferred from the value you assign. The core built-in types are int, float, str, and bool.",
        code: `name = "Rana"
age = 21
height = 5.9
is_student = True

print(name, age, height, is_student)
print(type(name), type(age), type(height), type(is_student))`,
      },
      {
        id: "operators",
        title: "Operators",
        summary: "Arithmetic, comparison, and logical operators used to build expressions.",
        explanation:
          "Python supports arithmetic (+ - * / // % **), comparison (== != < > <= >=), and logical (and, or, not) operators. Operator precedence follows standard math conventions, and parentheses can make intent explicit.",
        code: `a, b = 10, 3
print(a + b, a - b, a * b, a / b, a // b, a % b, a ** b)
print(a > b and b > 0)`,
      },
      {
        id: "io",
        title: "Input / output",
        summary: "Reading from the keyboard with input() and writing with print().",
        explanation:
          "input() pauses the program and waits for the user to type a line, returning it as a string. print() writes text to the console, and f-strings make it easy to embed values inside a message.",
        code: `name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to RTB's Tech.")`,
      },
      {
        id: "conditions",
        title: "Conditional statements",
        summary: "Branching logic with if / elif / else.",
        explanation:
          "Conditionals let a program choose between different blocks of code depending on whether an expression is true or false. Python uses indentation, not braces, to mark blocks.",
        code: `score = 78

if score >= 90:
    print("Grade: A")
elif score >= 75:
    print("Grade: B")
elif score >= 60:
    print("Grade: C")
else:
    print("Grade: F")`,
      },
      {
        id: "loops",
        title: "Loops",
        summary: "Repeating work with for and while loops.",
        explanation:
          "A for loop iterates over a sequence (like range() or a list). A while loop repeats as long as a condition stays true. break exits a loop early, and continue skips to the next iteration.",
        code: `for i in range(1, 6):
    print("Iteration", i)

count = 0
while count < 3:
    print("count =", count)
    count += 1`,
      },
      {
        id: "functions",
        title: "Functions",
        summary: "Reusable, named blocks of logic that take inputs and return outputs.",
        explanation:
          "def defines a function. Parameters are the inputs, and return sends a value back to the caller. Type hints (like `name: str`) document expected types without enforcing them at runtime.",
        code: `def greet(name: str) -> str:
    return f"Hello, {name}!"

def add(a: int, b: int) -> int:
    return a + b

print(greet("RTB's Tech"))
print("2 + 3 =", add(2, 3))`,
      },
      {
        id: "strings",
        title: "Strings",
        summary: "Text values and common operations for working with them.",
        explanation:
          "Strings support slicing, concatenation, and a large set of built-in methods (.upper(), .split(), .replace(), and more). f-strings are the modern way to format text with embedded expressions.",
        code: `text = "RTB's Tech"
print(text.upper())
print(text[0:3])
print(text.replace("Tech", "IDE"))
print(f"Length: {len(text)} characters")`,
      },
      {
        id: "lists",
        title: "Lists",
        summary: "Ordered, mutable collections of items.",
        explanation:
          "Lists hold an ordered sequence of items that can be changed after creation. They support indexing, slicing, and methods like append(), remove(), and sort().",
        code: `topics = ["variables", "loops", "functions"]
topics.append("oop")
print(topics)
print(topics[0], topics[-1])
topics.sort()
print(topics)`,
      },
      {
        id: "tuples",
        title: "Tuples",
        summary: "Ordered, immutable collections — useful for fixed groups of values.",
        explanation:
          "Tuples look like lists but cannot be modified after creation. They're often used for fixed-size records, like coordinates, or for returning multiple values from a function.",
        code: `point = (10, 20)
x, y = point
print(f"x={x}, y={y}")

def min_max(values):
    return min(values), max(values)

print(min_max([4, 1, 7, 3]))`,
      },
      {
        id: "sets",
        title: "Sets",
        summary: "Unordered collections of unique items.",
        explanation:
          "Sets automatically remove duplicates and support fast membership tests plus mathematical operations like union and intersection.",
        code: `a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)  # union
print(a & b)  # intersection
print(3 in a)`,
      },
      {
        id: "dictionaries",
        title: "Dictionaries",
        summary: "Key-value pairs for structured, lookup-friendly data.",
        explanation:
          "A dict maps keys to values. Lookups by key are fast, and dicts are the natural way to represent structured records in Python.",
        code: `student = {"name": "Rana", "roll_no": 101, "grade": "A"}
print(student["name"])
student["grade"] = "A+"
for key, value in student.items():
    print(key, "->", value)`,
      },
      {
        id: "exceptions",
        title: "Exception handling",
        summary: "Gracefully handling runtime errors with try / except.",
        explanation:
          "try/except catches errors so a program can respond instead of crashing. finally runs regardless of whether an exception occurred, which is useful for cleanup.",
        code: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Cannot divide by zero!")
        return None
    finally:
        print("Division attempt finished.")

print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
      },
      {
        id: "file-handling",
        title: "File handling",
        summary: "Reading and writing text files with the with statement.",
        explanation:
          "The with statement opens a file and automatically closes it afterwards, even if an error occurs. Files are typically opened in 'r' (read), 'w' (write), or 'a' (append) mode.",
        code: `with open("notes.txt", "w") as f:
    f.write("RTB's Tech makes learning Python easy.\\n")

with open("notes.txt", "r") as f:
    print(f.read())`,
      },
    ],
  },
  {
    category: "Object-Oriented Programming",
    topics: [
      {
        id: "classes-objects",
        title: "Classes & objects",
        summary: "Blueprints (classes) and the instances (objects) created from them.",
        explanation:
          "A class defines the structure and behavior shared by its instances. __init__ is the constructor — it runs automatically when a new object is created, setting up its initial attributes.",
        code: `class Student:
    def __init__(self, name):
        self.name = name

    def introduce(self):
        print(f"My name is {self.name}")

student = Student("Rana")
student.introduce()`,
      },
      {
        id: "encapsulation",
        title: "Encapsulation",
        summary: "Bundling data and behavior together, and controlling access to internal state.",
        explanation:
          "A leading underscore (_balance) signals 'internal use'; a leading double underscore triggers name-mangling for stronger privacy. Encapsulation keeps an object's internal state consistent by routing changes through methods.",
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    def deposit(self, amount):
        if amount > 0:
            self._balance += amount

    def get_balance(self):
        return self._balance

acc = BankAccount("Rana")
acc.deposit(500)
print(acc.get_balance())`,
      },
      {
        id: "inheritance",
        title: "Inheritance",
        summary: "Creating a new class that reuses and extends an existing one.",
        explanation:
          "A subclass inherits attributes and methods from its parent class and can override them. super() calls the parent's implementation, which is useful for extending rather than replacing behavior.",
        code: `class Student:
    def __init__(self, name):
        self.name = name

    def introduce(self):
        print(f"My name is {self.name}")

class GraduateStudent(Student):
    def __init__(self, name, thesis):
        super().__init__(name)
        self.thesis = thesis

    def introduce(self):
        super().introduce()
        print(f"My thesis topic is: {self.thesis}")

GraduateStudent("Taqweem", "AI in Education").introduce()`,
      },
      {
        id: "polymorphism",
        title: "Polymorphism",
        summary: "Different classes responding to the same method call in their own way.",
        explanation:
          "Polymorphism means objects of different classes can be used interchangeably if they implement the same method name. Each class provides its own version of the method's behavior.",
        code: `class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

for animal in [Dog(), Cat()]:
    print(animal.speak())`,
      },
      {
        id: "abstraction",
        title: "Abstraction",
        summary: "Exposing only what's necessary and hiding implementation details.",
        explanation:
          "Python's abc module lets you define abstract base classes with methods that subclasses must implement. This defines a contract without dictating how the details work.",
        code: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self):
        return self.w * self.h

print(Rectangle(4, 5).area())`,
      },
    ],
  },
];
