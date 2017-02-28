import { combineReducers, createStore, Store } from "redux";
import { Action, createAction, handleActions } from "redux-actions";

// entities
interface ITodo {
    id?: number;
    text: string;
    completed: boolean;
}

type Todos = ITodo[];

// action types

const ADD_TODO        = "ADD_TODO";
const DELETE_TODO     = "DELETE_TODO";
const EDIT_TODO       = "EDIT_TODO";
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

// initial state

const initialState: Todos = [{
    completed: false,
    id: 1,
    text: "Use Redux with Typescript",
}];

// reducer

const todosReducer = handleActions<Todos, ITodo>({

  [DELETE_TODO]: (state: Todos, action: Action<ITodo>): Todos => {
    if (action.payload === undefined) { return state; }
    const item = action.payload;
    return state.filter( (todo) => todo.id !== item.id );
  },

  [ADD_TODO]: (state: Todos, action: Action<ITodo>): Todos => {
    if (action.payload === undefined) { return state; }
    return [...state, {
      completed: action.payload.completed,
      id: state.reduce((maxId, todo) => Math.max(todo.id || 0, maxId), -1) + 1,
      text: action.payload.text,
    }];
  },

  [EDIT_TODO]: (state: Todos, action: Action<ITodo>): Todos => {
    if (action.payload === undefined) { return state; }
    const item = action.payload;
    return state.map((todo) =>
      todo.id === item.id
        ? Object.assign({}, todo, { text: item.text })
        : todo,
    );
  },

  [COMPLETE_TODO]: (state: Todos, action: Action<ITodo>): Todos => {
    if (action.payload === undefined) { return state; }
    const item = action.payload;
    return state.map((todo) =>
      todo.id === item.id ?
        Object.assign({}, todo, { completed: !todo.completed }) :
        todo,
    );
  },

  [COMPLETE_ALL]: (state: Todos): Todos => {
    const areAllMarked = state.every((todo) => todo.completed);
    return state.map((todo) => Object.assign({}, todo, {
      completed: !areAllMarked,
    }));
  },

  [CLEAR_COMPLETED]: (state: Todos): Todos => {
    return state.filter((todo) => todo.completed === false);
  },

}, initialState);

const rootReducer = combineReducers({
  todos: todosReducer,
});

// store

const rootInitialState = {};

const store: Store<any> = createStore(rootReducer, rootInitialState);

console.log(store.getState());
console.log(store.dispatch(addTodo("Another todo")));
console.log(store.getState());

const currentTodos: Todos = store.getState().todos;
const todoToDelete = currentTodos[1];

console.log(store.dispatch(deleteTodo(todoToDelete)));
console.log(store.getState());


