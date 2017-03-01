import { List } from "immutable";
import { createStore, Store } from "redux";
import { Action, createAction, handleActions } from "redux-actions";
import { combineReducers } from "redux-immutable";
import { makeTypedFactory, recordify, TypedRecord } from "typed-immutable-record";

// entities
interface ITodo {
    id?: number;
    text: string;
    completed: boolean;
}

interface ITodoRecord extends TypedRecord<ITodoRecord>, ITodo { };

const defaultTodo = {
    completed: false,
    id: undefined,
    text: "",
};

const TodoFactory = makeTypedFactory<ITodo, ITodoRecord>(defaultTodo);

type TodosList = List<ITodoRecord>;

interface IAppState {
    todos: TodosList;
}

interface IAppStateRecord extends TypedRecord<IAppStateRecord>, IAppState { };

// action types

const ADD_TODO        = "ADD_TODO";
const DELETE_TODO     = "DELETE_TODO";
const UPDATE_TODO     = "UPDATE_TODO";
const COMPLETE_TODO   = "COMPLETE_TODO";
const COMPLETE_ALL    = "COMPLETE_ALL";
const CLEAR_COMPLETED = "CLEAR_COMPLETED";

// actions

const addTodo = createAction<ITodo, string>(
    ADD_TODO,
    (text: string) => ({ completed: false, id: undefined, text}),
);

const deleteTodo = createAction<ITodo, ITodo>(
    DELETE_TODO,
    (todo: ITodo) => todo,
);

const updateTodo = createAction<ITodo, ITodo>(
    UPDATE_TODO,
    (todo: ITodo) => todo,
);

const completeTodo = createAction<ITodo, ITodo>(
    COMPLETE_TODO,
    (todo: ITodo) => todo,
);

const completeAll = createAction(
    COMPLETE_ALL,
);

const clearCompleted = createAction(
    CLEAR_COMPLETED,
);

// initial state

const initialState: TodosList = List([TodoFactory({
    completed: false,
    id: 1,
    text: "Use Redux with Typescript",
})]);

// reducer

function getNextTodoId(state: TodosList): number {
    const todoRecord = state.last();
    const lastId = (todoRecord ? todoRecord.get("id") : 0) as number;
    return lastId + 1;
}

const todosReducer = handleActions<TodosList, ITodo>({

    [DELETE_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
        if (action.payload === undefined) { return state; }
        const todo = action.payload;
        const index = state.findIndex((item) => !!item && item.get("id") === todo.id);
        if (index === -1) { return state; }
        return state.delete(index);
    },

    [ADD_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
        if (action.payload === undefined) { return state; }
        const nextId = getNextTodoId(state);
        const todo = Object.assign({}, action.payload, {id: nextId});
        const todoRecord = recordify<ITodo, ITodoRecord>(todo);
        return state.push(todoRecord);
    },

    [UPDATE_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
        if (action.payload === undefined) { return state; }
        const todo = action.payload;
        const todoRecord = recordify<ITodo, ITodoRecord>(todo);
        const index = state.findIndex((item) => !!item && item.get("id") === todo.id);
        return state.update(index, () => todoRecord);
    },

    [COMPLETE_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
        if (action.payload === undefined) { return state; }
        const todo = action.payload;
        const index = state.findIndex((item) => !!item && item.get("id") === todo.id);
        return state.update(index, (todoRecord) => todoRecord.set("completed", true));
    },

    [COMPLETE_ALL]: (state: TodosList): TodosList => {
        // Couldn't figure out how to get Immutable.List .map()... working with typescript
        // I think there's a bug in the typedefs... for now, shotgun approach...
        const todos: ITodo[] = state.toJS();
        return List<ITodoRecord>(todos.map((todo) => {
            const completedTodo = Object.assign({}, todo, {completed: true});
            return recordify<ITodo, ITodoRecord>(completedTodo);
        }));
    },

    [CLEAR_COMPLETED]: (state: TodosList): TodosList => {
        // Couldn't figure out how to get Immutable.List .filter()... working with typescript
        // I think there's a bug in the typedefs... for now, shotgun approach...
        const todos: ITodo[] = state.toJS().filter((todo: ITodo) => !todo.completed);
        return List<ITodoRecord>(todos.map((todo) => {
            return recordify<ITodo, ITodoRecord>(todo);
        }));
    },

}, initialState);


const rootReducer = combineReducers({
  todos: todosReducer,
});

// store

const rootInitialState = recordify<IAppState, IAppStateRecord>({
    todos: List([]),
});

const store: Store<any> = createStore(rootReducer, rootInitialState);

// initial state
console.log(store.getState().toJS());

// add one todo
console.log(store.dispatch(addTodo("First todo")));
console.log(store.getState().toJS());

// add 2nd todo
console.log(store.dispatch(addTodo("Second todo")));
console.log(store.getState().toJS());

// inspect todos
const currentTodos: TodosList = store.getState().get("todos");
console.log("currentTodos: ", currentTodos.toJS());

// get a todo to edit
const todoToEdit = currentTodos.get(1);
console.log("todoToEdit: ", todoToEdit.toJS());

// edit todo
const todoEdited = todoToEdit.update("text", () => "Changed title");
console.log("todoEdited: ", todoEdited.toJS());

// update state with edited todo
console.log(store.dispatch(updateTodo(todoEdited.toJS())));
console.log(store.getState().toJS());

// update state with completed todo
console.log(store.dispatch(completeTodo(todoEdited.toJS())));
console.log(store.getState().toJS());

// update state with completed todo
console.log(store.dispatch(completeAll()));
console.log(store.getState().toJS());

// get a todo to be deleted
const todoToDelete = store.getState().get("todos").get(0);
console.log("todoToDelete: ", todoToDelete);

// delete the todo
console.log(store.dispatch(deleteTodo(todoToDelete)));
console.log(store.getState().toJS());

// clear completed todos
console.log(store.dispatch(clearCompleted()));
console.log(store.getState().toJS());
