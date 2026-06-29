import { describe, it, expect } from 'vitest'
import { getDeadlineDisplay } from './util'

describe('getDeadlineDisplay', () => {
  it('returns No deadline when deadline is null', () => {
    expect(getDeadlineDisplay(null, 0).text).toBe('No deadline')
  })

  it('returns No deadline when deadline is empty string', () => {
    expect(getDeadlineDisplay('', 0).text).toBe('No deadline')
  })

  it('returns formatted date when daysLeft > 14', () => {
    const result = getDeadlineDisplay('2026-12-31', 180)
    expect(result.text).toBe('Dec 31, 2026')
    expect(result.className).toContain('text-gray-900')
  })

  it('returns days left in amber when daysLeft is 14 (boundary)', () => {
    const result = getDeadlineDisplay('2026-07-12', 14)
    expect(result.text).toBe('14 days left')
    expect(result.className).toContain('text-amber-600')
  })

  it('returns days left in amber when daysLeft is between 1 and 13', () => {
    const result = getDeadlineDisplay('2026-07-05', 7)
    expect(result.text).toBe('7 days left')
    expect(result.className).toContain('text-amber-600')
  })

  it('uses singular "day" when daysLeft is 1', () => {
    const result = getDeadlineDisplay('2026-06-29', 1)
    expect(result.text).toBe('1 day left')
  })

  it('returns Overdue in red when daysLeft is 0', () => {
    const result = getDeadlineDisplay('2026-06-28', 0)
    expect(result.text).toBe('Overdue')
    expect(result.className).toContain('text-red-600')
  })

  it('returns Overdue in red when daysLeft is negative', () => {
    const result = getDeadlineDisplay('2026-06-01', -5)
    expect(result.text).toBe('Overdue')
    expect(result.className).toContain('text-red-600')
  })
})
