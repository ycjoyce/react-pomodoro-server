const { send } = require("express/lib/response");
const request = require("supertest");
const app = require("../src/app");
const Record = require("../src/models/record");
const {
  setupDatabase,
  userOne,
  userTwo,
  taskOne,
  taskThree,
  recordOne,
} = require("./fixtures/db");

beforeEach(setupDatabase);

describe("新增紀錄", () => {
  test("應該能夠新增紀錄", async () => {
    const exampleRecord = {
      date: "2022-02-17",
      task: taskOne._id,
      count: 2,
    };
    await request(app)
      .post("/records")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send(exampleRecord)
      .expect(201);
  });

  test("沒授權應該不能新增紀錄", async () => {
    const exampleRecord = {
      date: "2022-01-01",
      task: taskThree._id,
      count: 5,
    };

    await request(app)
      .post("/records")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send(exampleRecord)
      .expect(404);

    await request(app).post("/records").send(exampleRecord).expect(401);
  });
});

describe("讀取不分 task 的紀錄", () => {
  test("應該能讀取所有紀錄", async () => {
    const response = await request(app)
      .get("/records")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(response.body.length).toBe(3);

    const responseTwo = await request(app)
      .get("/records")
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(200);
    expect(responseTwo.body.length).toBe(0);
  });

  test("應該能讀取特定日期的紀錄", async () => {
    const response = await request(app)
      .get("/records?date=2022-01-01")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(response.body.length).toBe(1);
    const responseTwo = await request(app)
      .get("/records?date=2022-02-01")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(responseTwo.body.length).toBe(2);
    const responseThree = await request(app)
      .get("/records?date=2022-02-01")
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(200);
    expect(responseThree.body.length).toBe(0);
  });

  test("沒授權應該不能讀取紀錄", async () => {
    await request(app).get("/records").send().expect(401);
  });
});

describe("讀取特定 task 的紀錄", () => {
  test("應該能讀取特定 task 的紀錄", async () => {
    const response = await request(app)
      .get(`/records/task/${taskOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
    expect(response.body.length).toBe(2);
  });

  test("task id 錯誤應回傳 500", async () => {
    await request(app)
      .get("/records/task/tasknotexisted")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(500);
  });

  test("沒授權應該不能讀取紀錄", async () => {
    await request(app)
      .get(`/records/task/${taskOne._id}`)
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404);

    await request(app).get(`/records/task/${taskOne._id}`).send().expect(401);
  });
});

describe("讀取特定紀錄", () => {
  test("應該能讀取特定紀錄", async () => {
    await request(app)
      .get(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  test("task id 錯誤應回傳 500", async () => {
    await request(app)
      .get("/records/notexistrecord")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(500);
  });

  test("沒授權應該不能讀取特定紀錄", async () => {
    await request(app)
      .get(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404);
    await request(app).get(`/records/${recordOne._id}`).send().expect(401);
  });
});

describe("更新紀錄", () => {
  test("應該能更新紀錄", async () => {
    await request(app)
      .patch(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({ count: 99 })
      .expect(200);
    const record = await Record.findById(recordOne._id);
    expect(record.count).toBe(99);
  });

  test("應該只能更新特定欄位", async () => {
    await request(app)
      .patch(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({ height: 99 })
      .expect(400);
  });

  test("沒授權應該不能更新紀錄", async () => {
    await request(app)
      .patch(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send({ count: 99 })
      .expect(404);

    await request(app)
      .patch(`/records/${recordOne._id}`)
      .send({ count: 99 })
      .expect(401);
  });
});

describe("刪除紀錄", () => {
  test("應該能刪除紀錄", async () => {
    await request(app)
      .delete(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  test("沒授權應該不能刪除紀錄", async () => {
    await request(app)
      .delete(`/records/${recordOne._id}`)
      .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404);

    await request(app).delete(`/records/${recordOne._id}`).send().expect(401);
  });
});
