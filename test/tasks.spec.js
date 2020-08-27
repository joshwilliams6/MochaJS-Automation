// eslint-disable-next-line no-unused-vars
const should = require('chai').should();
const fetch = require('node-fetch');
const env = require('../env.json');

const baseURL = env[process.env.STAGE].tasksURL;

const ARRAY_IS_EMPTY = 'Array is empty!';
const CANT_FIND_TASK = "Can't find task with given id";
const ALL_TASKS_DELETED = 'All tasks were deleted!';
const TASK_DELETED = 'Task has been deleted succesfully!';
const DONE_TASK_MESSAGE = 'A task in Done status cannot be reopened';
const TASK1 = { title: 'Test Title1', description: 'Test description' };
const TASK2 = { title: 'Test Title2', description: 'Test description' };
const doneStatus = 'DONE';
const openStatus = 'OPEN';

const loadTask = async (task) => {
  const response = await fetch(`${baseURL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return await response.json();
};

const moveOneTask = async (id, status) => (
  await fetch(`${baseURL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus: status }),
  })
);

const getAllTasks = async () => (await fetch(`${baseURL}`, { method: 'GET' }));

const getOneTask = async (id) => (await fetch(`${baseURL}/${id}`, { method: 'GET' }));

const deleteOneTask = async (id) => (await fetch(`${baseURL}/${id}`, { method: 'DELETE' }));

const cleanAllTasks = async () => (await fetch(`${baseURL}`, { method: 'DELETE' }));

describe('Tasks API Test Suite', () => {
  beforeEach(async () => {
    cleanAllTasks();
  });

  it('POST - Add one task', async () => {
    const result = await loadTask(TASK1);
    result.should.include(TASK1);
  });

  it('GET - Retrieve all tasks when the array is empty', async () => {
    const emptyResponse = await getAllTasks();
    const emptyResult = await emptyResponse.text();
    emptyResult.should.contain(ARRAY_IS_EMPTY);
  });

  it('GET - Retrieve all tasks when there are tasks in the array', async () => {
    await loadTask(TASK1);
    await loadTask(TASK2);
    const notEmptyResponse = await getAllTasks();
    const notEmptyResult = await notEmptyResponse.json();
    notEmptyResult[0].should.include(TASK1);
    notEmptyResult[1].should.include(TASK2);
  });

  it('GET /:id - Retrieve one task with a non-existing id', async () => {
    const nonExistingID = 'nonExistingID';
    const emptyResponse = await getOneTask(nonExistingID);
    const emptyResult = await emptyResponse.text();
    emptyResult.should.equal(CANT_FIND_TASK);
  });

  it('GET /:id - Retrieve one task with an existing id', async () => {
    const { id } = await loadTask(TASK1);
    const validResponse = await getOneTask(id);
    const validResult = await validResponse.json();
    validResult.should.include(TASK1);
  });

  it('DELETE - Delete all tasks', async () => {
    const response = await cleanAllTasks();
    const result = await response.text();
    result.should.equal(ALL_TASKS_DELETED);
  });

  it('DELETE /:id - Delete one task', async () => {
    const { id } = await loadTask(TASK1);
    const deleteResponse = await deleteOneTask(id);
    const deleteResult = await deleteResponse.text();
    deleteResult.should.equal(TASK_DELETED);

    const getResponse = await getOneTask(id);
    const getResult = await getResponse.text();
    getResult.should.equal(CANT_FIND_TASK);
  });

  it('PUT :/id - Move one task from open to done', async () => {
    const { id } = await loadTask(TASK1);

    const openToDoneResponse = await moveOneTask(id, doneStatus);
    const openToDoneResult = await openToDoneResponse.json();
    openToDoneResult.should.contain(TASK1);
    openToDoneResult.status.should.equal(doneStatus);
  });

  it('PUT :/id - Move one task from done to open', async () => {
    const { id } = await loadTask(TASK1);

    const openToDoneResponse = await moveOneTask(id, doneStatus);
    const openToDoneResult = await openToDoneResponse.json();
    openToDoneResult.should.contain(TASK1);
    openToDoneResult.status.should.equal(doneStatus);

    const doneToOpenResponse = await moveOneTask(id, openStatus);
    const doneToOpenResult = await doneToOpenResponse.text();
    doneToOpenResult.should.equal(DONE_TASK_MESSAGE);
  });
});
