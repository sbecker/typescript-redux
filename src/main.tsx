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
// const EDIT_TODO       = "EDIT_TODO";
// const COMPLETE_TODO   = "COMPLETE_TODO";
// const COMPLETE_ALL    = "COMPLETE_ALL";
// const CLEAR_COMPLETED = "CLEAR_COMPLETED";

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

const initialState: TodosList = List([TodoFactory({
    completed: false,
    id: 1,
    text: "Use Redux with Typescript",
})]);

// reducer

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
    const todoRecord = recordify<ITodo, ITodoRecord>(action.payload);
    return state.push(todoRecord);
  },

//   [EDIT_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
//     if (action.payload === undefined) { return state; }
//     const item = action.payload;
//     return state.map((todo) =>
//       todo.id === item.id
//         ? Object.assign({}, todo, { text: item.text })
//         : todo,
//     );
//   },

//   [COMPLETE_TODO]: (state: TodosList, action: Action<ITodo>): TodosList => {
//     if (action.payload === undefined) { return state; }
//     const item = action.payload;
//     return state.map((todo) =>
//       todo.id === item.id ?
//         Object.assign({}, todo, { completed: !todo.completed }) :
//         todo,
//     );
//   },

//   [COMPLETE_ALL]: (state: TodosList): TodosList => {
//     const areAllMarked = state.every((todo) => todo.completed);
//     return state.map((todo) => Object.assign({}, todo, {
//       completed: !areAllMarked,
//     }));
//   },

//   [CLEAR_COMPLETED]: (state: TodosList): TodosList => {
//     return state.filter((todo) => todo.completed === false);
//   },

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
console.log('currentTodos: ', currentTodos.toJS());

// get a todo to be deleted
const todoToDelete = currentTodos.get(0);
console.log('todoToDelete: ', todoToDelete.toJS());

// delete the todo
console.log(store.dispatch(deleteTodo(todoToDelete)));
console.log(store.getState().toJS());


