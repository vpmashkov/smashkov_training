import type { Units } from '../types'

const KG_PER_LB = 0.45359237
const CM_PER_INCH = 2.54
const REP_LOAD_BUMP_KG = 2.5
const REP_LOAD_BUMP_LB = 5

export function kgToDisplay(kg: number, units: Units): number {
  if (units === 'imperial') return roundTo(kg / KG_PER_LB, 1)
  return roundTo(kg, 1)
}

export function displayToKg(value: number, units: Units): number {
  if (units === 'imperial') return value * KG_PER_LB
  return value
}

export function cmToDisplay(cm: number, units: Units): number {
  if (units === 'imperial') return roundTo(cm / CM_PER_INCH, 1)
  return roundTo(cm, 1)
}

export function displayToCm(value: number, units: Units): number {
  if (units === 'imperial') return value * CM_PER_INCH
  return value
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_INCH
  const feet = Math.floor(totalInches / 12)
  const inches = roundTo(totalInches - feet * 12, 1)
  if (inches >= 12) return { feet: feet + 1, inches: 0 }
  return { feet, inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH
}

export function weightUnitLabel(units: Units): string {
  return units === 'imperial' ? 'lb' : 'kg'
}

export function heightUnitLabel(units: Units): string {
  return units === 'imperial' ? 'in' : 'cm'
}

export function loadIncrementKg(units: Units): number {
  if (units === 'imperial') return REP_LOAD_BUMP_LB * KG_PER_LB
  return REP_LOAD_BUMP_KG
}

export function formatWeight(kg: number, units: Units): string {
  return `${kgToDisplay(kg, units)} ${weightUnitLabel(units)}`
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
