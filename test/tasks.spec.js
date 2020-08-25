const fetch = require('node-fetch');
const assert = require('chai').should();
const baseURL = 'http://localhost:3000/tasks'

const loadTask = async (task) => {
    const response = await fetch(`${baseURL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    })
    const result = await response.json()
    return result.id
}

const cleanAllTasks = async () => {
    await fetch(`${baseURL}`, { method: 'DELETE' })
}

describe('Tasks API Test Suite', () => {

    beforeEach(async () => {
        cleanAllTasks()
    })

    it('Add one task', async () => {
        const task1 = { title: "Test Title3", description: "Test description" }
        const response = await fetch(`${baseURL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task1)
        })
        const result = await response.json();
        result.should.include(task1);
    });

    it('Retrieve all tasks when there no tasks on the array', async () => {
        const response = await fetch(`${baseURL}`, { method: 'GET' });
        const result = await response.text();
        result.should.contain('Array is empty!');
    });

    it('Retrieve all tasks when there are some tasks on the array', async () => {
        const task1 = { title: "Test Title1", description: "Test description" }
        const task2 = { title: "Test Title2", description: "Test description" }
        await loadTask(task1)
        await loadTask(task2)
        const response = await fetch(`${baseURL}`, { method: 'GET' });
        const result = await response.json();
        result[0].should.include(task1);
        result[1].should.include(task2);
    });

    it('Retrieve one task with an exisiting id', async () => {
        const task1 = { title: "Test Title1", description: "Test description" }
        const id = await loadTask(task1)
        const response = await fetch(`${baseURL}/${id}`, { method: 'GET' });
        const result = await response.json();
        result.should.include(task1);
    });

    it('Retrieve one task with non exisiting id', async () => {
        const id = "invalidID"
        const response = await fetch(`${baseURL}/${id}`, { method: 'GET' });
        const result = await response.text();
        result.should.equal("Can't find task with given id");
    });

    it('Delete all tasks', async () => {
        const response = await fetch(`${baseURL}`, { method: 'DELETE' });
        const result = await response.text();
        result.should.equal("All tasks were deleted!");
    });

    it('Delete an existing task', async () => {
        const task1 = { title: "Test Title1", description: "Test description" }
        const id = await loadTask(task1)
        const deleteResponse = await fetch(`${baseURL}/${id}`, { method: 'DELETE' });
        const deleteResult = await deleteResponse.text();
        deleteResult.should.contain("Task has been deleted succesfully!");
        const getResponse = await fetch(`${baseURL}/${id}`, { method: 'GET' });
        const getResult = await getResponse.text();
        getResult.should.equal("Can't find task with given id");

    });

    it('Delete a non existing task', async () => {
        const id = "invalidID"
        const response = await fetch(`${baseURL}/${id}`, { method: 'DELETE' });
        const result = await response.text();
        result.should.equal("Can't find task with given id");
    });

    it('Move an open task to done', async () => {
        const task1 = { title: "Test Title1", description: "Test description" }
        const id = await loadTask(task1)
        const done = "DONE"
        const response = await fetch(`${baseURL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStatus: done })
        })
        const result = await response.json();
        result.should.contain(task1);
        result.status.should.equal(done);
    });

    it('Move a done task to a previous status', async () => {
        const task1 = { title: "Test Title1", description: "Test description" }
        const id = await loadTask(task1)
        const done = "DONE"
        const open = "OPEN"
        await fetch(`${baseURL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStatus: done })
        })
        const response = await fetch(`${baseURL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStatus: open })
        })
        const result = await response.text();
        result.should.equal("A task in Done status cannot be reopened");
    });

})