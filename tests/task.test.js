const { send } = require("express/lib/response");
const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const { userOne, setupDatabase, taskTwo, taskOne, taskThree } = require("./fixtures/db");

beforeEach(setupDatabase);

describe("新增案件", () => {
  test("應該能新增案件", async () => {
    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        title: "task1",
        length: 5,
        completed: true,
      })
      .expect(201);
  });

  test("沒有授權應該不能新增案件", async () => {
    await request(app)
      .post("/tasks")
      .send({
        title: "task1",
        length: 5,
      })
      .expect(401);
  });

  test("資料不齊應該不能新增案件", async () => {
    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({})
      .expect(400);
  });

  test("應該設定正確預設值", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        title: "task1",
        length: 10
      })
      .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task.completed).toBe(false);
  });
});

describe("讀取案件", () => {
  test("應該能讀取所有案件", async () => {
    const response = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  test("應該能按完成狀態讀取案件", async () => {
    const completedResponse = await request(app)
      .get("/tasks?completed=true")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(completedResponse.body.length).toBe(1);

    const uncompletedResponse = await request(app)
      .get("/tasks?completed=false")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(uncompletedResponse.body.length).toBe(1);
  });

  test("應該能限制讀取數量", async () => {
    const response = await request(app)
      .get("/tasks?limit=1")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(response.body.length).toBe(1);

    const responseTwo = await request(app)
      .get("/tasks?limit=1&skip=1")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(responseTwo.body.length).toBe(1);
    expect(responseTwo.body[0]._id).toBe(taskTwo._id.toString());
  });

  test("應該能排序讀取案件", async () => {
    const response = await request(app)
      .get("/tasks?sortBy=createdAt:desc")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(response.body[0]._id).toBe(taskTwo._id.toString());
  });

  test("沒有授權應該不能讀取案件", async () => {
    await request(app)
      .get("/tasks")
      .send()
      .expect(401);
  });
});

describe("讀取特定案件", () => {
  test("應該能讀取特定案件", async () => {
    await request(app)
      .get(`/tasks/${taskOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  test("沒授權應該不能讀取特定案件", async () => {
    await request(app)
      .get(`/tasks/${taskThree._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(404);
    await request(app)
      .get(`/tasks/${taskThree._id}`)
      .send()
      .expect(401);
  });
});

describe("更新案件", () => {
  test("應該能夠更新案件", async () => {
    const updatedTask = {
      title: "updated",
      length: 9,
      completed: true,
    };

    const response = await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send(updatedTask)
      .expect(200);

    expect(response.body).toMatchObject(updatedTask);
  });

  test("應該只能更新特定的欄位", async () => {
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({ height: 100 })
      .expect(400);
  });

  test("沒授權應該不能更新案件", async () => {
    await request(app)
      .patch(`/tasks/${taskThree._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({ title: "update" })
      .expect(404);
    
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .send({ title: "something" })
      .expect(401);
  });
});

describe("刪除案件", () => {
  test("應該能夠刪除案件", async () => {
    await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  test("沒授權應該不能刪除案件", async () => {
    await request(app)
      .delete(`/tasks/${taskThree._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(404);
    await request(app)
      .delete(`/tasks/${taskThree._id}`)
      .send()
      .expect(401);
  });
});