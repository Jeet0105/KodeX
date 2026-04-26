import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "http://localhost:2358";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const judge0Client = axios.create({
  baseURL: JUDGE0_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Submit code to Judge0 and return the token
 */
const submitCode = async ({ source_code, language_id, stdin = "" }) => {
  const response = await judge0Client.post(
    "/submissions?base64_encoded=true",
    {
      source_code: Buffer.from(source_code).toString("base64"),
      language_id,
      stdin: Buffer.from(stdin).toString("base64"),
    }
  );

  return response.data.token;
};

/**
 * Poll Judge0 until the submission is done
 */
const pollResult = async (token, retries = 10, interval = 1000) => {
  for (let i = 0; i < retries; i++) {
    const response = await judge0Client.get(
      `/submissions/${token}?base64_encoded=true`
    );

    const { status } = response.data;

    // 1 = In Queue, 2 = Processing — keep polling
    if (status.id !== 1 && status.id !== 2) {
      return response.data;
    }

    await sleep(interval);
  }

  throw new Error("Code execution timed out");
};

/**
 * Decode base64 output safely
 */
const decode = (str) =>
  str ? Buffer.from(str, "base64").toString("utf-8") : null;

/**
 * Run all test cases — accepts language_id directly from driverCode
 */
export const runAllTestCases = async ({ source_code, language_id, testCases }) => {
  if (!language_id) {
    throw new Error("language_id is required");
  }

  if (!testCases || testCases.length === 0) {
    throw new Error("No test cases provided");
  }

  // Submit all in parallel
  const tokens = await Promise.all(
    testCases.map(({ input }) =>
      submitCode({ source_code, language_id, stdin: input ?? "" })
    )
  );

  // Poll all in parallel
  const results = await Promise.all(
    tokens.map((token) => pollResult(token))
  );

  let allPassed = true;

  const detailed = results.map((result, index) => {
    const stdout = decode(result.stdout)?.trim();
    const expected = testCases[index].expected_output?.trim();
    const passed = result.status.id === 3 && stdout === expected;

    if (!passed) allPassed = false;

    return {
      testCase: index + 1,
      passed,
      stdin: testCases[index].input,
      expected_output: expected,
      actual_output: stdout,
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      status: result.status,
      time: result.time,
      memory: result.memory,
    };
  });

  return { allPassed, results: detailed };
};