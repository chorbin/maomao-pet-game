import type { SkillId, PerformResult } from '@/types'
import { SKILLS, PERFORM_REWARD } from './constants'

export function calculatePerformResult(selectedSkills: SkillId[], intimacy: number): PerformResult {
  const skillDetails = selectedSkills
    .map(id => SKILLS.find(s => s.id === id))
    .filter(Boolean)

  const totalScore = skillDetails.reduce((sum, s) => sum + (s?.performanceScore || 0), 0)
  const intimacyBonus = Math.floor(intimacy / 100)
  const finalScore = totalScore + intimacyBonus

  let grade: 'S' | 'A' | 'B' | 'C'
  if (finalScore >= 100) grade = 'S'
  else if (finalScore >= 60) grade = 'A'
  else if (finalScore >= 30) grade = 'B'
  else grade = 'C'

  const reward = PERFORM_REWARD[grade]
  const coins = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min

  return { grade, score: finalScore, coins }
}
