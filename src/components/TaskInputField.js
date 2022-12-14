import React from "react";
import { DarkModeContext } from "./context";
import { useContext } from "react";

function TaskInputField({
  input,
  handleOnChange,
  descriptionRef,
  handleCancelButton,
  addTask,
  tasks,
  inputFieldRef,
}) {
  const { isDark } = useContext(DarkModeContext);

  return (
    <div
      ref={inputFieldRef}
      className="main--left--task__div"
      style={{
        paddingLeft: tasks.editMode ? "1em" : "0",
      }}
    >
      <div
        className={
          isDark
            ? "main--left--task__div__textfield darkMode"
            : "main--left--task__div__textfield"
        }
      >
        <input
          type="text"
          placeholder="Title"
          name="title"
          value={input.title}
          onChange={handleOnChange}
        />
        <textarea
          ref={descriptionRef}
          placeholder="Description"
          name="description"
          value={input.description}
          onChange={handleOnChange}
        />
      </div>
      <div className="main--left--task__div__button">
        <button
          className={
            isDark
              ? "main--left--task__div__button__cancel darkMode"
              : "main--left--task__div__button__cancel"
          }
          onClick={handleCancelButton}
        >
          Cancel
        </button>
        <button
          className={
            isDark
              ? "main--left--task__div__button__add darkMode"
              : "main--left--task__div__button__add"
          }
          onClick={addTask}
        >
          {tasks.editMode ? "Save edit" : "Add task"}
        </button>
      </div>
    </div>
  );
}

export default TaskInputField;
