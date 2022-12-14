import React, {
  useContext,
  useState,
  useReducer,
  useRef,
  useEffect,
} from "react";
import { nanoid } from "nanoid";
import Header from "./Header";
import Footer from "./Footer";
import Task from "./Task";
import { DarkModeContext } from "./context";
import TaskInputField from "./TaskInputField";
import { reducer } from "./reducer";

function Home() {
  const { isDark } = useContext(DarkModeContext);
  const [input, setInput] = useState({
    title: "",
    description: "",
    createdDate: "",
    completedDate: "",
    isComplete: false,
    key: "",
  });

  const [tasks, dispatcher] = useReducer(reducer, {
    userTasks: [],
    editKey: "",
    editMode: false,
    isModal: false,
    message: "",
  });

  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [isNewTask, setIsNewTask] = useState(true);

  function getScreenSize() {
    setScreenSize(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener("resize", getScreenSize);

    return () => {
      window.removeEventListener("resize", getScreenSize);
    };
  }, [screenSize]);

  useEffect(() => {
    if (screenSize < 650) {
      setIsNewTask(false);
    } else {
      setIsNewTask(true);
    }
  }, [screenSize]);

  function openTaskInputField() {
    if (screenSize <= 650) {
      setIsNewTask(true);
    }
  }

  function handleOnChange(e) {
    const { name } = e.target;
    const { value } = e.target;
    setInput((prevState) => {
      return { ...prevState, [name]: value };
    });
  }

  const descriptionRef = useRef();

  let day = new Date().getDate();
  let month = new Date().getMonth();
  let year = new Date().getFullYear();
  let date = `${day}/${month}/${year}`;

  const [sortArray, setSortArray] = useState([]);
  const [isSorting, setIsSorting] = useState(false);

  function addTask() {
    if (!tasks.editMode) {
      if (input.title && input.description) {
        if (screenSize <= 650) {
          setIsNewTask(false);
        }
        dispatcher({
          type: "ADD_TASK",
          payload: {
            ...input,
            key: nanoid(),
            createdDate: date,
          },
        });
        setInput((prevState) => {
          return { ...prevState, title: "", description: "" };
        });
      }
      return;
    } else {
      if (screenSize <= 650) {
        setIsNewTask(false);
      }
      dispatcher({ type: "EDIT_TASK", payload: input });
      setSortArray((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.key === tasks.editKey) {
            return {
              ...task,
              ...input,
            };
          }
          return task;
        });
      });
      setInput((prevState) => {
        return { ...prevState, title: "", description: "" };
      });
    }
  }

  function handleCancelButton() {
    if (screenSize <= 650) {
      setIsNewTask(false);
    }
    if (tasks.editMode) {
      dispatcher({ type: "SWITCH_BACK_FROM_EDIT_MODE" });
      setInput((prevState) => {
        return { ...prevState, title: "", description: "" };
      });
    } else {
      setInput((prevState) => {
        return { ...prevState, title: "", description: "" };
      });
    }
  }

  function deleteTask(key) {
    dispatcher({ type: "DELETE_TASK", payload: key });
    if (isSorting) {
      setSortArray((prevArray) => {
        return prevArray.filter((task) => {
          return task.key !== key;
        });
      });
    }
  }

  function startEditMode(key) {
    setIsNewTask(true);

    setTimeout(() => {
      tasks.userTasks.find((task) => {
        if (task.key === key) {
          setInput({ ...task });
        }
        return dispatcher({ type: "EDIT_MODE", payload: key });
      });
    });
    setTimeout(() => {
      descriptionRef.current.focus();
    }, 50);
  }

  function toggleComplete(key) {
    setSortArray((prevTask) => {
      return prevTask.map((task) => {
        if (task.key === key) {
          return {
            ...task,
            isComplete: true,
            completedDate: date,
          };
        }
        return task;
      });
    });
    dispatcher({ type: "TOGGLE_COMPLETE", payload: { key, date } });
  }

  useEffect(() => {
    const data = localStorage.getItem("tasks");
    if (data) {
      dispatcher({ type: "LOAD_STORED_DATA", payload: JSON.parse(data) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatcher({ type: "RESET_MODAL" });
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  });

  useEffect(() => {
    dispatcher({ type: "SWITCH_BACK_FROM_EDIT_MODE" });
  }, []);

  const dragStartRef = useRef();
  const dragEnterRef = useRef();

  function onDragStart(index) {
    dragStartRef.current = index;
  }

  function onDragEnter(index) {
    dragEnterRef.current = index;
  }

  function onDragEnd() {
    if (!isSorting) {
      dispatcher({
        type: "REARRANGE_TASKS",
        payload: { dragStartRef, dragEnterRef },
      });
    }
  }

  function handleSortValueChange(e) {
    dispatcher({ type: "SWITCH_BACK_FROM_EDIT_MODE" });
    setInput({ title: "", description: "" });

    if (e.target.value === "completed") {
      setIsSorting(true);
      setSortArray(() => {
        return tasks.userTasks.filter((task) => {
          return task.isComplete;
        });
      });
    } else if (e.target.value === "unCompleted") {
      setIsSorting(true);
      setSortArray(() => {
        return tasks.userTasks.filter((task) => {
          return !task.isComplete;
        });
      });
    } else if (e.target.value === "default") {
      setSortArray([]);
      setIsSorting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="main">
        <section className="main--left">
          <p className="main--left__date">Today: {date}</p>
          <div className="main--left__addBtn" onClick={openTaskInputField}>
            <p className={isDark ? "p--darkMode" : ""}>+</p>
            <h3>Add New Task</h3>
          </div>
          {!tasks.editMode && isNewTask && (
            <TaskInputField
              input={input}
              handleOnChange={handleOnChange}
              descriptionRef={descriptionRef}
              handleCancelButton={handleCancelButton}
              addTask={addTask}
              tasks={tasks}
            />
          )}
        </section>
        <section className="main--right">
          <div className="main--right__sort">
            <i className="fa-solid fa-sort"></i>
            <p>Sorted by</p>
            <select onChange={handleSortValueChange}>
              <option>default</option>
              <option>completed</option>
              <option>unCompleted</option>
            </select>
          </div>
          <Task
            tasks={tasks}
            deleteTask={deleteTask}
            startEditMode={startEditMode}
            toggleComplete={toggleComplete}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            input={input}
            handleOnChange={handleOnChange}
            descriptionRef={descriptionRef}
            handleCancelButton={handleCancelButton}
            addTask={addTask}
            sortArray={sortArray}
            isSorting={isSorting}
            isNewTask={isNewTask}
          />
        </section>
        {tasks.isModal && (
          <p
            style={{
              backgroundColor: isDark ? "white" : "#281732",
              color: isDark ? "green" : "white",
            }}
            className="modal__message"
          >
            {tasks.message}
            <span>
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Home;
