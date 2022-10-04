import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { Balloon } from "../../security/balloon.ts";

interface TestVector {
  password: string;
  salt: string;
  space_cost: number;
  time_cost: number;
  output: string;
}

Deno.test("Chomp/Security/Password", async (t) => {
  await t.step("Balloon", async () => {
    // Create list of our test vectors
    const test_vectors: TestVector[] = [
      {
        "password": "hunter42",
        "salt": "examplesalt",
        "space_cost": 1024,
        "time_cost": 3,
        "output": "716043dff777b44aa7b88dcbab12c078abecfac9d289c5b5195967aa63440dfb",
      },
      {
        "password": "",
        "salt": "salt",
        "space_cost": 3,
        "time_cost": 3,
        "output": "5f02f8206f9cd212485c6bdf85527b698956701ad0852106f94b94ee94577378",
      },
      {
        "password": "password",
        "salt": "",
        "space_cost": 3,
        "time_cost": 3,
        "output": "20aa99d7fe3f4df4bd98c655c5480ec98b143107a331fd491deda885c4d6a6cc",
      },
      {
        "password": "\0",
        "salt": "\0",
        "space_cost": 3,
        "time_cost": 3,
        "output": "4fc7e302ffa29ae0eac31166cee7a552d1d71135f4e0da66486fb68a749b73a4",
      },
      {
        "password": "password",
        "salt": "salt",
        "space_cost": 1,
        "time_cost": 1,
        "output": "eefda4a8a75b461fa389c1dcfaf3e9dfacbc26f81f22e6f280d15cc18c417545",
      },
    ];

    for(const vector of test_vectors) {
      const res = await Balloon.balloon(vector.password, vector.salt, vector.space_cost, vector.time_cost, 3);
      assertEquals(vector.output, res);
    }
  });
});
