export function analyzeThinking(userApproach: string, problemContext: string) {
  const hasTimeComplexity = /O\(.*\)|time complexity|big o/i.test(userApproach);
  const hasSpaceComplexity = /space|memory/i.test(userApproach);
  const hasDataStructure =
    /array|hash|map|set|tree|stack|queue|heap|graph|linked list|trie/i.test(
      userApproach,
    );
  const hasPattern =
    /two pointer|sliding window|binary search|dfs|bfs|dynamic programming|dp|greedy|backtrack|divide and conquer/i.test(
      userApproach,
    );
  const hasBruteForce = /brute force|nested loop|check all|try every/i.test(
    userApproach,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const followUpQuestions: string[] = [];

  if (hasDataStructure) {
    strengths.push('Identified relevant data structures');
  } else {
    weaknesses.push('Did not clearly identify a suitable data structure');
  }

  if (hasTimeComplexity) {
    strengths.push('Considered time complexity');
  } else {
    weaknesses.push('Did not mention time complexity');
  }

  if (hasSpaceComplexity) {
    strengths.push('Considered space usage');
  } else {
    followUpQuestions.push('What is the space complexity of your approach?');
  }

  if (hasPattern) {
    strengths.push('Recognized an algorithmic pattern');
  } else {
    followUpQuestions.push(
      'Is there a known DSA pattern that fits this problem?',
    );
  }

  if (hasBruteForce) {
    strengths.push('Started from a brute force baseline');
    followUpQuestions.push(
      'Where is the repeated work in the brute force approach?',
    );
  }

  return {
    problemContext,
    thinkingScore: Math.min(5, strengths.length + 1),
    strengths,
    weaknesses,
    followUpQuestions,
  };
}

export function gradeExecutionResult(submission?: {
  status?: string;
  statusCode?: number;
  runtime?: number;
  error?: string;
  output?: string;
  expectedOutput?: string;
}) {
  if (!submission) {
    return {
      codeScore: 0,
      verdict: 'No submission yet',
      nextActions: ['Submit code so AI Mirror can grade the actual result'],
    };
  }

  const status = submission.status || 'unknown';

  if (status === 'success') {
    return {
      codeScore: 100,
      verdict: 'Accepted',
      nextActions: [
        'Explain your time and space complexity',
        'Try one edge case manually',
        'Ask AI Mirror for optimization feedback',
      ],
    };
  }

  if (status === 'wrong_answer') {
    return {
      codeScore: 45,
      verdict: 'Wrong Answer',
      nextActions: [
        'Compare actual output with expected output line by line',
        'Check boundary cases and formatting',
        'Trace the smallest failing input by hand',
      ],
    };
  }

  if (status === 'compile_error') {
    return {
      codeScore: 20,
      verdict: 'Compilation Error',
      nextActions: [
        'Fix the first compiler error before changing logic',
        'Check missing return statements, headers, semicolons, and types',
      ],
    };
  }

  if (status === 'runtime_error') {
    return {
      codeScore: 30,
      verdict: 'Runtime Error',
      nextActions: [
        'Check invalid indexing, division by zero, recursion depth, and null values',
        'Add prints around the line that can crash',
      ],
    };
  }

  return {
    codeScore: 10,
    verdict: status,
    nextActions: ['Wait for execution to finish or rerun the submission'],
  };
}
