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
