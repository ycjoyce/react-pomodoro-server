const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

describe("建立使用者", () => {
  test("應該能建立新的使用者", async () => {
    const exampleUser = {
      device: "exampleDevice1",
    };
    const response = await request(app)
      .post("/users")
      .send(exampleUser)
      .expect(201);
  
    const user = await User.findById(response.body.user._id);
  
    expect(user).not.toBeNull();
  
    expect(response.body).toMatchObject({
      user: {
        device: exampleUser.device,
      },
      token: user.tokens[0].token,
    });
  });

  test("應該不能重複建立使用者", async () => {
    await request(app)
      .post("/users")
      .send(userOne)
      .expect(400);
  });

  test("沒有提供device的話應該不能建立使用者", async () => {
    await request(app)
      .post("/users")
      .send({})
      .expect(400);
  });
});

describe("登入使用者", () => {
  test("正確的使用者應該能登入", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        device: userOne.device,
      })
      .expect(200);
    
    const user = await User.findById(userOneId);

    expect(response.body.token).toBe(user.tokens[1].token);
  });

  test("未註冊的 device 應該不能登入", async () => {
    await request(app)
      .post("/users/login")
      .send({
        device: "anonexisteddevice",
      })
      .expect(400);
  });
});

describe("登出使用者", () => {
  test("應該能登出使用者", async () => {
    await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);

    const user = await User.findById(userOneId);
    expect(user.tokens.length).toBe(0);
  });

  test("沒有授權應該不能登出使用者", async () => {
    await request(app)
      .post("/users/logout")
      .send()
      .expect(401);
  });
});