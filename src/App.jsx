import { useEffect, useMemo, useRef, useState } from "react";
import introVideo from "./assets/intro.mp4";

const STORAGE_KEY = "student-friendly-tasks-v1";
const HOMEWORK_TAGS_KEY = "student-friendly-homework-tags-v1";
const CATEGORY_OPTIONS = ["Homework", "Revision", "Project", "Exam Prep", "Other"];
const STATUS_FILTERS = ["All", "Active", "Completed"];
const DEFAULT_HOMEWORK_TAGS = ["Reading", "Worksheet", "Essay"];
const MOTIVATION_QUOTES = [
  {
    text: "You are not the opinion of someone who doesn't know you.",
    artist: "Taylor Swift",
  },
  {
    text: "Comparison can steal your joy, so keep your eyes on your own lane.",
    artist: "Olivia Rodrigo",
  },
  {
    text: "I just wanna be with you.",
    artist: "The Ridleys",
    song: "Be With You",
  },
  {
    text: "Love is patient, love is kind, and love is choosing each other every day.",
    artist: "The Ridleys",
    song: "Love Is",
  },
  {
    text: "No song without you.",
    artist: "HONNE",
    song: "No Song Without You",
  },
  {
    text: "And every summer time, with you.",
    artist: "NIKI",
    song: "Every Summertime",
  },
  {
    text: "Take a chance with me.",
    artist: "NIKI",
    song: "Take a Chance With Me",
  },
  {
    text: "You can thank your stars all you want, but I'll always be the lucky one.",
    artist: "Rico Blanco",
    song: "Your Universe",
  },
  {
    text: "It's not living if it's not with you.",
    artist: "The 1975",
    song: "It's Not Living (If It's Not With You)",
  },
  {
    text: "Till they take my heart away.",
    artist: "MYMP",
    song: "Till They Take My Heart Away",
  },
  {
    text: "I like me better when I'm with you.",
    artist: "Lauv",
    song: "I Like Me Better",
  },
  {
    text: "Baby, this love I'll never let it die.",
    artist: "Daniel Caesar",
    song: "Always",
  },
];
const BLOOM_VIDEO_SRC = introVideo;

function readInitialTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readInitialHomeworkTags() {
  try {
    const raw = localStorage.getItem(HOMEWORK_TAGS_KEY);
    if (!raw) return DEFAULT_HOMEWORK_TAGS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_HOMEWORK_TAGS;
    const cleanTags = parsed.filter((tag) => typeof tag === "string" && tag.trim().length > 0);
    return cleanTags.length > 0 ? cleanTags : DEFAULT_HOMEWORK_TAGS;
  } catch {
    return DEFAULT_HOMEWORK_TAGS;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(readInitialTasks);
  const [homeworkTags, setHomeworkTags] = useState(readInitialHomeworkTags);
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState(CATEGORY_OPTIONS[0]);
  const [draftHomeworkTag, setDraftHomeworkTag] = useState("Reading");
  const [newHomeworkTag, setNewHomeworkTag] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderFading, setIsLoaderFading] = useState(false);
  const loaderVideoRef = useRef(null);

  useEffect(() => {
    const quoteTimer = window.setInterval(() => {
      setActiveQuoteIndex((previousIndex) => (previousIndex + 1) % MOTIVATION_QUOTES.length);
    }, 6000);
    return () => window.clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) return undefined;
    const videoNode = loaderVideoRef.current;
    if (videoNode) {
      videoNode.playbackRate = 2;
    }

    const bootTimer = window.setTimeout(() => {
      setIsLoaderFading(true);
      window.setTimeout(() => {
        setIsLoading(false);
      }, 420);
    }, 3000);

    return () => window.clearTimeout(bootTimer);
  }, [isLoading]);

  useEffect(() => {
    if (homeworkTags.length === 0) return;
    const hasActiveTag = homeworkTags.includes(draftHomeworkTag);
    if (!hasActiveTag) {
      setDraftHomeworkTag(homeworkTags[0]);
    }
  }, [homeworkTags, draftHomeworkTag]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
            ? !task.completed
            : task.completed;

      const matchesCategory =
        categoryFilter === "All categories" ? true : task.category === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [tasks, statusFilter, categoryFilter]);

  const saveTasks = (nextTasks) => {
    setTasks(nextTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
  };

  const saveHomeworkTags = (nextTags) => {
    setHomeworkTags(nextTags);
    localStorage.setItem(HOMEWORK_TAGS_KEY, JSON.stringify(nextTags));
  };

  const addHomeworkTag = () => {
    const normalizedTag = newHomeworkTag.trim();
    if (!normalizedTag) return;
    const alreadyExists = homeworkTags.some(
      (tag) => tag.toLowerCase() === normalizedTag.toLowerCase(),
    );
    if (alreadyExists) {
      const matchedTag =
        homeworkTags.find((tag) => tag.toLowerCase() === normalizedTag.toLowerCase()) ??
        homeworkTags[0] ??
        "Reading";
      setDraftHomeworkTag(matchedTag);
      setNewHomeworkTag("");
      return;
    }

    const nextTags = [...homeworkTags, normalizedTag];
    saveHomeworkTags(nextTags);
    setDraftHomeworkTag(normalizedTag);
    setNewHomeworkTag("");
  };

  const removeHomeworkTag = (tagToRemove) => {
    const isDefaultTag = DEFAULT_HOMEWORK_TAGS.some(
      (defaultTag) => defaultTag.toLowerCase() === tagToRemove.toLowerCase(),
    );
    if (isDefaultTag) return;

    const nextTags = homeworkTags.filter((tag) => tag !== tagToRemove);
    const finalTags = nextTags.length > 0 ? nextTags : DEFAULT_HOMEWORK_TAGS;
    saveHomeworkTags(finalTags);

    if (draftHomeworkTag === tagToRemove) {
      setDraftHomeworkTag(finalTags[0]);
    }
  };

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;

    const nextTask = {
      id: crypto.randomUUID(),
      title,
      category: draftCategory,
      homeworkTag: draftCategory === "Homework" ? draftHomeworkTag || null : null,
      dueDate: draftDueDate || null,
      completed: false,
      createdAt: Date.now(),
    };

    saveTasks([nextTask, ...tasks]);
    setDraft("");
    setDraftDueDate("");
  };

  const toggleTask = (id) => {
    const nextTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    );
    saveTasks(nextTasks);
  };

  const deleteTask = (id) => {
    const nextTasks = tasks.filter((task) => task.id !== id);
    saveTasks(nextTasks);
  };

  const clearCompleted = () => {
    const nextTasks = tasks.filter((task) => !task.completed);
    saveTasks(nextTasks);
  };

  const hasCompletedTasks = completedCount > 0;

  const onInputKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  const onNewHomeworkTagKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addHomeworkTag();
    }
  };

  const activeQuote = MOTIVATION_QUOTES[activeQuoteIndex];
  const activeQuoteSource = activeQuote.song
    ? `${activeQuote.artist} - ${activeQuote.song}`
    : activeQuote.artist;
  const customHomeworkTags = homeworkTags.filter(
    (tag) => !DEFAULT_HOMEWORK_TAGS.some((defaultTag) => defaultTag.toLowerCase() === tag.toLowerCase()),
  );

  if (isLoading) {
    return (
      <main className="loadingScreen">
        <div className={isLoaderFading ? "loaderFrame fadeOut" : "loaderFrame"}>
          <video
            ref={loaderVideoRef}
            className="loaderVideo"
            src={BLOOM_VIDEO_SRC}
            autoPlay
            muted
            playsInline
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="todoCard">
        <header className="header">
          <p className="eyebrow">perle&apos;s list</p>
          <h1>Today&apos;s Learning Tasks</h1>
          <blockquote key={activeQuoteIndex} className="subtitle quoteTransition" aria-live="polite">
            &quot;{activeQuote.text}&quot; <span className="quoteSource">{activeQuoteSource}</span>
          </blockquote>
        </header>

        <div className="taskInputRow">
          <input
            type="text"
            className="taskInput"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Add a task (e.g., review chapter 4 notes)"
            aria-label="Task title"
          />
          <select
            className="taskSelect"
            value={draftCategory}
            onChange={(event) => setDraftCategory(event.target.value)}
            aria-label="Task category"
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="taskDate"
            value={draftDueDate}
            onChange={(event) => setDraftDueDate(event.target.value)}
            aria-label="Due date"
          />
          <button type="button" className="addButton" onClick={addTask}>
            Add
          </button>
        </div>
        {draftCategory === "Homework" ? (
          <>
            <div className="homeworkTagRow">
              <select
                className="taskSelect"
                value={draftHomeworkTag}
                onChange={(event) => setDraftHomeworkTag(event.target.value)}
                aria-label="Homework tag"
              >
                {homeworkTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="taskInput"
                value={newHomeworkTag}
                onChange={(event) => setNewHomeworkTag(event.target.value)}
                onKeyDown={onNewHomeworkTagKeyDown}
                placeholder="Create a new homework tag"
                aria-label="Create a new homework tag"
              />
              <button type="button" className="addTagButton" onClick={addHomeworkTag}>
                Add tag
              </button>
            </div>
            {customHomeworkTags.length > 0 ? (
              <div className="customTagList" aria-label="Custom homework tags">
                {customHomeworkTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="customTagChip"
                    onClick={() => removeHomeworkTag(tag)}
                    aria-label={`Delete homework tag ${tag}`}
                    title={`Delete "${tag}"`}
                  >
                    {tag} <span aria-hidden="true">x</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        <div className="progressRow">
          <p className="progressText">
            {completedCount} of {tasks.length} done
          </p>
          <button
            type="button"
            className="clearButton"
            onClick={clearCompleted}
            disabled={!hasCompletedTasks}
          >
            Clear completed
          </button>
        </div>

        <div className="filterBar">
          <div className="statusFilters" role="group" aria-label="Filter tasks by status">
            {STATUS_FILTERS.map((filterName) => (
              <button
                key={filterName}
                type="button"
                className={statusFilter === filterName ? "filterPill active" : "filterPill"}
                onClick={() => setStatusFilter(filterName)}
              >
                {filterName}
              </button>
            ))}
          </div>
          <select
            className="categoryFilter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter tasks by category"
          >
            <option value="All categories">All categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {tasks.length === 0 ? (
          <div className="emptyState">
            <p>No tasks yet. Add your first one and get a quick win.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="emptyState">
            <p>No tasks match this filter yet.</p>
          </div>
        ) : (
          <ul className="taskList">
            {filteredTasks.map((task) => (
              <li key={task.id} className="taskItem">
                <label className="taskLabel">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as complete`}
                  />
                  <span className={task.completed ? "taskTitle done" : "taskTitle"}>
                    {task.title}
                  </span>
                </label>
                <div className="taskMeta">
                  <span className="chip categoryChip">{task.category || "Other"}</span>
                  {task.category === "Homework" && task.homeworkTag ? (
                    <span className="chip homeworkTagChip">{task.homeworkTag}</span>
                  ) : null}
                  {task.dueDate ? (
                    <span className="chip dueChip">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="deleteButton"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete task: ${task.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
