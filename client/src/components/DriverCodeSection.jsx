import { useFormContext } from "react-hook-form"
import { FiCode, FiTerminal } from "react-icons/fi"

const languages = ["cpp", "java", "python", "javascript"]

const langColors = {
  cpp: "text-blue-500",
  java: "text-orange-500",
  python: "text-yellow-400",
  javascript: "text-yellow-300"
}

const starterPlaceholders = {
  cpp: `class Solution {
public:
    // Implement your logic here
    vector<int> functionName(vector<int>& nums, int target) {
        
    }
};`,

  java: `class Solution {
    // Implement your logic here
    public int[] functionName(int[] nums, int target) {
        
    }
}`,

  python: `class Solution:
    # Implement your logic here
    def function_name(self, nums, target):
        pass`,

  javascript: `class Solution {
    // Implement your logic here
    functionName(nums, target) {
        
    }
}`
}

const wrapperPlaceholders = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for(int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    int target;
    cin >> target;

    Solution sol;
    auto result = sol.functionName(nums, target);

    cout << result[0] << " " << result[1];
    return 0;
}`,

  java: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();
        int[] nums = new int[n];

        for(int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        int target = sc.nextInt();

        Solution sol = new Solution();
        int[] result = sol.functionName(nums, target);

        System.out.println(result[0] + " " + result[1]);
    }
}`,

  python: `{{USER_CODE}}

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().strip().split()

    n = int(data[0])
    nums = list(map(int, data[1:n+1]))
    target = int(data[n+1])

    sol = Solution()
    result = sol.function_name(nums, target)

    print(result[0], result[1])`,

  javascript: `{{USER_CODE}}

const fs = require("fs");
const input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);

let index = 0;
const n = parseInt(input[index++]);
const nums = [];

for (let i = 0; i < n; i++) {
    nums.push(parseInt(input[index++]));
}

const target = parseInt(input[index++]);

const sol = new Solution();
const result = sol.functionName(nums, target);

console.log(result[0] + " " + result[1]);`
}

function DriverCodeSection() {
  const { register } = useFormContext()

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl space-y-6 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
          <FiTerminal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Driver Code</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure starter code and hidden execution wrapper for each language.
            Wrapper must include{" "}
            <span className="text-teal-400 font-mono">
              {"{{USER_CODE}}"}
            </span>.
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-6">
        {languages.map((lang, index) => (
          <div
            key={lang}
            className="bg-black/20 border border-white/5 p-5 rounded-xl space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiCode className={langColors[lang]} />
              <h3 className={`font-bold uppercase tracking-wider ${langColors[lang]}`}>
                {lang}
              </h3>
            </div>

            {/* Hidden Language Field */}
            <input
              type="hidden"
              value={lang}
              {...register(`driverCode.${index}.language`)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Starter Code */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium ml-1">
                  Starter Code (Visible to User)
                </label>
                <textarea
                  {...register(`driverCode.${index}.starterCode`)}
                  placeholder={starterPlaceholders[lang]}
                  rows={10}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-300 placeholder:text-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all resize-y"
                />
              </div>

              {/* Wrapper Code */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium ml-1">
                  Solution Wrapper (Hidden Execution Logic)
                </label>
                <textarea
                  {...register(`driverCode.${index}.solutionWrapper`)}
                  placeholder={wrapperPlaceholders[lang]}
                  rows={10}
                  className="w-full p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-300 placeholder:text-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all resize-y"
                />
              </div>

            </div>

            {/* Function Name */}
            <div className="pt-2">
              <label className="text-xs text-gray-400 font-medium ml-1 block mb-2">
                Function Name (Must match wrapper call)
              </label>
              <input
                type="text"
                {...register(`driverCode.${index}.functionName`)}
                placeholder="e.g. twoSum"
                className="w-full lg:w-1/2 p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-sm text-gray-200 placeholder:text-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default DriverCodeSection